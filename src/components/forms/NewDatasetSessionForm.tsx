import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormField from "../FormField";
import NewBenchmarkingSubmissionSchema from "../../schemas/NewBenchmarkingSubmission.schema";
import { NewBenchmarkingSubmission } from "@sine-fdn/sine-ts";

interface NewSubmissionFormProps {
  datasetId: string;
  inputTitles: string[];
  onSubmit: (data: NewBenchmarkingSubmission) => Promise<void>;
}

export default function NewDatasetSessionForm({
  datasetId: sessionId,
  inputTitles,
  onSubmit,
}: NewSubmissionFormProps) {
  const schema = useMemo(
    () => NewBenchmarkingSubmissionSchema(inputTitles.length),
    [inputTitles.length]
  );
  const { register, handleSubmit, errors } = useForm<NewBenchmarkingSubmission>(
    {
      mode: "onChange",
      resolver: yupResolver(schema),
      defaultValues: {
        sessionId,
        integerValues: inputTitles.map(() => 0),
      },
    }
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField error={errors.submitter?.message} label="Submitter">
        <input
          className="input"
          type="text"
          name="submitter"
          defaultValue=""
          placeholder="(Your Nickname)"
          ref={register}
        />
      </FormField>

      <input type="hidden" value={sessionId} name="sessionId" ref={register} />

      <FormField label={<h4 className="title is-4">Your Inputs</h4>} />

      {inputTitles.map((title, idx) => (
        <FormField
          label={title}
          key={idx}
          error={
            errors.integerValues
              ? errors.integerValues[idx]?.message
              : undefined
          }
        >
          <input
            className="input"
            type="text"
            name={`integerValues[${idx}]`}
            defaultValue=""
            placeholder="(a number)"
            ref={register({ valueAsNumber: true })}
          />
        </FormField>
      ))}

      <FormField>
        <input type="submit" className="button is-link" value="Absenden" />
      </FormField>
    </form>
  );
}
