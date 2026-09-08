"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Loader2,
} from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { submitSurvey } from "@/app/actions/submit-survey";
import {
  controlClasses,
  describedBy,
  FieldShell,
  OptionCard,
  Select,
} from "@/components/forms/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import { buildWhatsAppUrl, buildSurveyHandoffMessage } from "@/lib/whatsapp";
import {
  BUDGET_RANGES,
  OTHER_PROJECT_TYPE,
  OTHER_PROJECT_TYPE_REQUIRED,
  PROJECT_TYPES,
  PROPERTY_TYPES,
  PROVINCES,
  SURVEY_STEPS,
  TARGET_TIMELINES,
  formatSurveyDate,
  formatSurveyTime,
  jakartaToday,
  resolveProjectNeed,
  surveySchema,
  type SurveyInput,
} from "@/lib/schemas/survey";

type Status = "idle" | "error" | "success";

/**
 * Multi-step survey form (pasal 8).
 *
 * State lives in a single React Hook Form instance across all four steps, so
 * moving backwards never loses an answer. Each step validates only its own
 * fields; the Server Action re-validates the whole payload regardless.
 */
export function SurveyForm() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [started, setStarted] = useState(false);
  const [showCurrentStepErrors, setShowCurrentStepErrors] = useState(false);

  const formId = useId();

  const {
    control,
    register,
    handleSubmit,
    trigger,
    clearErrors,
    getValues,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<SurveyInput>({
    resolver: zodResolver(surveySchema),
    mode: "onTouched",
    defaultValues: {
      projectType: undefined,
      projectTypeOther: "",
      province: undefined,
      city: "",
      district: "",
      address: "",
      propertyType: undefined,
      targetTimeline: undefined,
      budgetRange: "Belum ditentukan",
      notes: "",
      name: "",
      whatsapp: "",
      emergencyPhone: "",
      surveyDate: "",
      surveyTime: "",
      consent: false,
    },
  });

  const currentStep = SURVEY_STEPS[step];
  const isLastStep = step === SURVEY_STEPS.length - 1;

  const markStarted = () => {
    if (started) return;
    setStarted(true);
    track("survey_start");
  };

  async function goNext() {
    setShowCurrentStepErrors(true);
    const valid = await trigger([...currentStep.fields], { shouldFocus: true });
    if (!valid) return;

    // "Lainnya needs its text" is an object-level rule in the schema, so it
    // only fires once every other field is filled in. Enforce it per-step here.
    if (currentStep.id === "ruangan") {
      const { projectType, projectTypeOther } = getValues();
      if (projectType === OTHER_PROJECT_TYPE && !projectTypeOther?.trim()) {
        setError("projectTypeOther", { message: OTHER_PROJECT_TYPE_REQUIRED });
        setFocus("projectTypeOther");
        return;
      }
    }

    track("survey_step_complete", { step: currentStep.id });
    goToStep(Math.min(step + 1, SURVEY_STEPS.length - 1));
  }

  function fieldError(field: keyof SurveyInput): string | undefined {
    const message = errors[field]?.message;

    return showCurrentStepErrors && typeof message === "string"
      ? message
      : undefined;
  }

  function goBack() {
    setStatus("idle");
    setMessage(null);
    goToStep(Math.max(step - 1, 0));
  }

  /**
   * Move to a step the visitor has not filled in yet.
   *
   * A failed submit validates the whole schema at once, so errors can be left
   * sitting on fields the visitor never reached. Clearing the destination's
   * errors on arrival means a step is only ever red because of something the
   * visitor just did there - stepping back and forward never resurfaces them.
   */
  function goToStep(target: number) {
    clearErrors([...SURVEY_STEPS[target].fields]);
    setShowCurrentStepErrors(false);
    setStep(target);
  }

  /** The prefilled wa.me link that carries the whole survey as one note. */
  function buildHandoffUrl(values: SurveyInput): string | null {
    return buildWhatsAppUrl({
      source: "survey_success",
      message: buildSurveyHandoffMessage({
        name: values.name,
        whatsapp: values.whatsapp,
        emergencyPhone: values.emergencyPhone,
        province: values.province ?? "",
        city: values.city,
        district: values.district,
        address: values.address,
        need: resolveProjectNeed(values),
        surveyDate: values.surveyDate ? formatSurveyDate(values.surveyDate) : "",
        surveyTime: values.surveyTime ? formatSurveyTime(values.surveyTime) : "",
        propertyType: values.propertyType,
        targetTimeline: values.targetTimeline,
        budgetRange: values.budgetRange,
        notes: values.notes || undefined,
      }),
    });
  }

  const submitSurveyForm = handleSubmit((values) => {
    // `useTransition` gives us the pending flag that blocks a second submit.
    startTransition(async () => {
      const payload = new FormData();
      for (const [key, value] of Object.entries(values)) {
        if (value === undefined || value === null) continue;
        payload.append(key, String(value));
      }

      const result = await submitSurvey(payload);

      if (result.status === "error") {
        setStatus("error");
        setMessage(result.message);
        // A role="alert" banner is announced without stealing focus; only a
        // specific bad field is worth moving the caret to.
        const firstField = result.fieldErrors
          ? (Object.keys(result.fieldErrors)[0] as keyof SurveyInput | undefined)
          : undefined;
        if (firstField) setFocus(firstField);
        return;
      }

      track("survey_submit", { projectType: values.projectType ?? "" });
      setStatus("success");
      setMessage(null);

      // Submitting *is* the hand-off: go straight to WhatsApp with the request
      // note prefilled. A same-tab navigation, so no popup blocker is involved;
      // the success screen renders underneath as the fallback.
      const handoff = buildHandoffUrl(values);
      if (handoff) {
        track("whatsapp_click", { source: "survey_success" });
        window.location.href = handoff;
      }
    });
  });

  const projectTypeError = fieldError("projectType");
  const projectTypeOtherError = fieldError("projectTypeOther");
  const provinceError = fieldError("province");
  const cityError = fieldError("city");
  const districtError = fieldError("district");
  const addressError = fieldError("address");
  const propertyTypeError = fieldError("propertyType");
  const targetTimelineError = fieldError("targetTimeline");
  const budgetRangeError = fieldError("budgetRange");
  const notesError = fieldError("notes");
  const nameError = fieldError("name");
  const whatsappError = fieldError("whatsapp");
  const emergencyPhoneError = fieldError("emergencyPhone");
  const surveyDateError = fieldError("surveyDate");
  const surveyTimeError = fieldError("surveyTime");
  const consentError = fieldError("consent");

  if (status === "success") {
    const values = getValues();
    const handoffUrl = buildHandoffUrl(values);

    return (
      <div className="space-y-space-lg text-center" role="status">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-container text-deep-black">
          <CircleCheck aria-hidden className="size-7" />
        </span>
        <div className="space-y-space-xs">
          <h3 className="text-headline-md-mobile text-on-surface lg:text-headline-md">
            Terima kasih, {values.name.split(" ")[0]}.
          </h3>
          <p className="mx-auto max-w-md text-body-md text-on-surface-variant">
            Data ruangan Anda sudah kami terima dan WhatsApp sedang kami buka
            dengan ringkasan permintaan survey Anda. Jika tidak terbuka
            otomatis, gunakan tombol di bawah ini.
          </p>
        </div>
        {handoffUrl ? (
          <Button
            href={handoffUrl}
            external
            onClick={() => track("whatsapp_click", { source: "survey_success" })}
          >
            Lanjutkan via WhatsApp
            <ArrowRight aria-hidden className="size-[18px]" />
          </Button>
        ) : (
          <p className="text-body-sm text-muted-gray">
            Tim kami akan menghubungi Anda melalui nomor yang dikirimkan.
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submitSurveyForm}
      onChange={markStarted}
      noValidate
      className="space-y-space-xl"
    >
      {/* Step indicator */}
      <ol className="flex items-center justify-center gap-space-xs text-center">
        {SURVEY_STEPS.map((item, index) => {
          const done = index < step;
          const active = index === step;
          return (
            <li key={item.id} className="flex items-center gap-space-xs">
              <span className="flex items-center gap-space-2xs">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-label-md font-bold",
                    active || done
                      ? "bg-primary-container text-deep-black"
                      : "bg-surface-container-high text-muted-gray"
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "hidden text-label-md sm:inline",
                    active ? "font-semibold text-on-surface" : "text-muted-gray"
                  )}
                >
                  {item.label}
                </span>
              </span>
              {index < SURVEY_STEPS.length - 1 ? (
                <span aria-hidden className="h-0.5 w-6 bg-surface-container-high" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* Step 1 - room type */}
      {step === 0 ? (
        <fieldset className="space-y-space-xs">
          <legend className="text-label-lg font-semibold text-on-surface">
            Langkah 1: Pilih kategori ruangan utama
          </legend>
          <Controller
            control={control}
            name="projectType"
            render={({ field }) => (
              <>
                <div className="grid gap-space-sm pt-space-xs sm:grid-cols-2 lg:grid-cols-3">
                  {PROJECT_TYPES.map((type) => (
                    <OptionCard
                      key={type}
                      name={field.name}
                      value={type}
                      checked={field.value === type}
                      onChange={(value) => {
                        markStarted();
                        field.onChange(value);
                      }}
                      onBlur={field.onBlur}
                    >
                      {type}
                    </OptionCard>
                  ))}
                </div>

                {projectTypeError ? (
                  <p role="alert" className="text-body-sm text-error">
                    {projectTypeError}
                  </p>
                ) : null}

                {/* Free text only matters once "Lainnya" is the answer. */}
                {field.value === OTHER_PROJECT_TYPE ? (
                  <FieldShell
                    id={`${formId}-project-other`}
                    label="Tulis kebutuhan Anda"
                    hint="Contoh: partisi ruangan, meja kerja custom, walk-in closet."
                    error={projectTypeOtherError}
                    className="pt-space-xs"
                  >
                    <input
                      className={controlClasses}
                      id={`${formId}-project-other`}
                      type="text"
                      placeholder="Ketik kebutuhan ruangan Anda"
                      aria-invalid={Boolean(projectTypeOtherError)}
                      aria-describedby={describedBy(
                        `${formId}-project-other`,
                        "hint",
                        projectTypeOtherError
                      )}
                      {...register("projectTypeOther")}
                    />
                  </FieldShell>
                ) : null}
              </>
            )}
          />
        </fieldset>
      ) : null}

      {/* Step 2 - location */}
      {step === 1 ? (
        <div className="space-y-space-md">
          <p className="text-label-lg font-semibold text-on-surface">
            Langkah 2: Lokasi project
          </p>
          <div className="grid gap-space-md sm:grid-cols-2">
            <FieldShell
              id={`${formId}-province`}
              label="Provinsi"
              error={provinceError}
            >
              <Select
                id={`${formId}-province`}
                aria-invalid={Boolean(provinceError)}
                aria-describedby={describedBy(
                  `${formId}-province`,
                  undefined,
                  provinceError
                )}
                defaultValue=""
                {...register("province")}
              >
                <option value="" disabled>
                  Pilih provinsi
                </option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <FieldShell
              id={`${formId}-city`}
              label="Kota / Kabupaten"
              error={cityError}
            >
              <input
                className={controlClasses}
                id={`${formId}-city`}
                type="text"
                autoComplete="address-level2"
                placeholder="Contoh: Bandung"
                aria-invalid={Boolean(cityError)}
                aria-describedby={describedBy(
                  `${formId}-city`,
                  undefined,
                  cityError
                )}
                {...register("city")}
              />
            </FieldShell>
          </div>

          <FieldShell
            id={`${formId}-district`}
            label="Kecamatan / area (opsional)"
            hint="Membantu kami memperkirakan penjadwalan survey."
            error={districtError}
          >
            <input
              id={`${formId}-district`}
              type="text"
              placeholder="Contoh: Antapani"
              className={controlClasses}
              aria-describedby={describedBy(`${formId}-district`, "hint")}
              {...register("district")}
            />
          </FieldShell>

          <FieldShell
            id={`${formId}-address`}
            label="Alamat lengkap"
            hint="Nama jalan, nomor rumah, RT/RW, dan patokan terdekat."
            error={addressError}
          >
            <textarea
              className={controlClasses}
              id={`${formId}-address`}
              rows={3}
              autoComplete="street-address"
              placeholder="Contoh: Jl. Melati Raya No.248, RT.006/RW.006, Cipondoh Indah"
              aria-invalid={Boolean(addressError)}
              aria-describedby={describedBy(
                `${formId}-address`,
                "hint",
                addressError
              )}
              {...register("address")}
            />
          </FieldShell>
        </div>
      ) : null}

      {/* Step 3 - property */}
      {step === 2 ? (
        <div className="space-y-space-md">
          <p className="text-label-lg font-semibold text-on-surface">
            Langkah 3: Jenis properti &amp; kebutuhan
          </p>
          <div className="grid gap-space-md sm:grid-cols-2">
            <FieldShell
              id={`${formId}-property-type`}
              label="Jenis properti"
              error={propertyTypeError}
            >
              <Select
                id={`${formId}-property-type`}
                defaultValue=""
                aria-invalid={Boolean(propertyTypeError)}
                {...register("propertyType")}
              >
                <option value="" disabled>
                  Pilih jenis properti
                </option>
                {PROPERTY_TYPES.map((propertyType) => (
                  <option key={propertyType} value={propertyType}>
                    {propertyType}
                  </option>
                ))}
              </Select>
            </FieldShell>

            <FieldShell
              id={`${formId}-timeline`}
              label="Target mulai pengerjaan"
              error={targetTimelineError}
            >
              <Select
                id={`${formId}-timeline`}
                defaultValue=""
                aria-invalid={Boolean(targetTimelineError)}
                {...register("targetTimeline")}
              >
                <option value="" disabled>
                  Pilih perkiraan waktu
                </option>
                {TARGET_TIMELINES.map((timelineOption) => (
                  <option key={timelineOption} value={timelineOption}>
                    {timelineOption}
                  </option>
                ))}
              </Select>
            </FieldShell>
          </div>

          <FieldShell
            id={`${formId}-budget`}
            label="Perkiraan budget (opsional)"
            hint="Membantu kami menyusun rekomendasi material yang realistis."
            error={budgetRangeError}
          >
            <Select
              id={`${formId}-budget`}
              {...register("budgetRange")}
            >
              {BUDGET_RANGES.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </Select>
          </FieldShell>

          <FieldShell
            id={`${formId}-notes`}
            label="Catatan kebutuhan (opsional)"
            hint="Ceritakan apa yang ingin disimpan, gaya yang disukai, atau kendala ruangan."
            error={notesError}
          >
            <textarea
              className={controlClasses}
              id={`${formId}-notes`}
              rows={4}
              {...register("notes")}
            />
          </FieldShell>

        </div>
      ) : null}

      {/* Step 4 - contact */}
      {step === 3 ? (
        <div className="space-y-space-md">
          <p className="text-label-lg font-semibold text-on-surface">
            Langkah 4: Kontak Anda
          </p>
          <div className="grid gap-space-md sm:grid-cols-2">
            <FieldShell
              id={`${formId}-name`}
              label="Nama lengkap"
              error={nameError}
            >
              <input
                className={controlClasses}
                id={`${formId}-name`}
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(nameError)}
                aria-describedby={describedBy(
                  `${formId}-name`,
                  undefined,
                  nameError
                )}
                {...register("name")}
              />
            </FieldShell>

            <FieldShell
              id={`${formId}-whatsapp`}
              label="Nomor WhatsApp aktif"
              error={whatsappError}
            >
              <input
                className={controlClasses}
                id={`${formId}-whatsapp`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+628xxxxxxxxxx"
                aria-invalid={Boolean(whatsappError)}
                aria-describedby={describedBy(
                  `${formId}-whatsapp`,
                  undefined,
                  whatsappError
                )}
                {...register("whatsapp")}
              />
            </FieldShell>
          </div>

          <FieldShell
            id={`${formId}-emergency`}
            label="Nomor darurat (opsional)"
            hint="Nomor kedua yang bisa dihubungi saat hari survey."
            error={emergencyPhoneError}
          >
            <input
              className={controlClasses}
              id={`${formId}-emergency`}
              type="tel"
              inputMode="tel"
              placeholder="+628xxxxxxxxxx"
              aria-invalid={Boolean(emergencyPhoneError)}
              aria-describedby={describedBy(
                `${formId}-emergency`,
                "hint",
                emergencyPhoneError
              )}
              {...register("emergencyPhone")}
            />
          </FieldShell>

          <fieldset className="space-y-space-xs">
            <legend className="text-label-md font-semibold text-on-surface">
              Jadwal survey yang Anda inginkan
            </legend>
            <p className="text-body-sm text-muted-gray">
              Tim kami akan mengonfirmasi ulang ketersediaan jadwal via WhatsApp.
            </p>
            <div className="grid gap-space-md pt-space-2xs sm:grid-cols-2">
              <FieldShell
                id={`${formId}-survey-date`}
                label="Hari / tanggal"
                error={surveyDateError}
              >
                <input
                  className={controlClasses}
                  id={`${formId}-survey-date`}
                  type="date"
                  min={jakartaToday()}
                  aria-invalid={Boolean(surveyDateError)}
                  aria-describedby={describedBy(
                    `${formId}-survey-date`,
                    undefined,
                    surveyDateError
                  )}
                  {...register("surveyDate")}
                />
              </FieldShell>

              <FieldShell
                id={`${formId}-survey-time`}
                label="Jam (WIB)"
                error={surveyTimeError}
              >
                <input
                  className={controlClasses}
                  id={`${formId}-survey-time`}
                  type="time"
                  step={900}
                  aria-invalid={Boolean(surveyTimeError)}
                  aria-describedby={describedBy(
                    `${formId}-survey-time`,
                    undefined,
                    surveyTimeError
                  )}
                  {...register("surveyTime")}
                />
              </FieldShell>
            </div>
          </fieldset>

          <div className="space-y-space-2xs">
            <label className="flex items-start gap-space-xs text-body-sm text-on-surface-variant">
              <input
                type="checkbox"
                className="mt-1 size-4 shrink-0 accent-primary-container"
                aria-invalid={Boolean(consentError)}
                {...register("consent")}
              />
              <span>
                Saya setuju data ini digunakan untuk keperluan koordinasi proyek,
                sesuai{" "}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="font-semibold underline underline-offset-2 transition-colors hover:text-primary"
                >
                  Kebijakan Privasi
                </Link>
                .
              </span>
            </label>
            {consentError ? (
              <p role="alert" className="text-body-sm text-error">
                {consentError}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {status === "error" && message ? (
        <p
          role="alert"
          className="rounded-md bg-error-container px-space-md py-space-sm text-body-sm text-on-error-container"
        >
          {message}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-space-md border-t border-border-hairline pt-space-lg">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={goBack}>
            <ArrowLeft aria-hidden className="size-4" />
            Kembali
          </Button>
        ) : (
          <span />
        )}

        {isLastStep ? (
          <Button
            type="submit"
            disabled={pending}
            onClick={() => setShowCurrentStepErrors(true)}
          >
            {pending ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                Kirim &amp; Dapatkan Estimasi
                <ArrowRight aria-hidden className="size-[18px]" />
              </>
            )}
          </Button>
        ) : (
          <Button type="button" onClick={goNext}>
            Lanjut
            <ArrowRight aria-hidden className="size-[18px]" />
          </Button>
        )}
      </div>

      <p className="text-center text-body-sm text-muted-gray">
        Privasi Anda aman bersama kami. Data hanya digunakan untuk keperluan
        koordinasi proyek.
      </p>
    </form>
  );
}
