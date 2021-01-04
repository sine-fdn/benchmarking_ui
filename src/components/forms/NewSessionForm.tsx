import React, { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormField from "../FormField";
import NewSessionSchema from "../../schemas/NewSession.schema";
import { NewSession } from "@sine-fdn/sine-ts";

interface NewSessionForm {
  onSubmit: (data: NewSession) => Promise<void>;
}

export default function NewSessionForm({ onSubmit }: NewSessionForm) {
  const { register, handleSubmit, control, errors } = useForm<NewSession>({
    mode: "onChange",
    resolver: yupResolver(NewSessionSchema),
  });
  const { fields, append } = useFieldArray({
    control,
    name: "input",
  });

  function addInput() {
    append({ title: "", computation: "RANKING" });
  }

  useEffect(addInput, []); // append an input field upon mounting of the form

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField label="Title" error={errors.title?.message}>
        <input
          className="input"
          type="text"
          name="title"
          defaultValue=""
          placeholder="Name des Benchmarkings"
          ref={register()}
        />
      </FormField>

      <FormField label="Number of parties" error={errors.numParties?.message}>
        <input
          className="input"
          type="text"
          name="numParties"
          placeholder="# of parties"
          defaultValue="4"
          ref={register()}
        />
      </FormField>

      {fields.map((item, index) => (
        <div key={item.id}>
          <FormField
            label={`Title of Input #${index + 1}`}
            error={errors.input?.[index]?.title?.message}
          >
            <input
              className="input"
              type="text"
              name={`input[${index}].title`}
              defaultValue={""}
              placeholder=""
              ref={register()}
            />
          </FormField>
          <input
            type="hidden"
            name={`input[${index}].computation`}
            defaultValue="RANKING"
            ref={register()}
          />
        </div>
      ))}

      <FormField>
        <button type="button" className="button is-success" onClick={addInput}>
          Add Input
        </button>
      </FormField>

      <FormField>
        <input type="submit" className="button is-link" />
      </FormField>
    </form>
  );
}
