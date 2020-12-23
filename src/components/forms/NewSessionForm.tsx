import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { NewSession } from "../../interfaces";
import FormField from "../FormField";
import NewSessionSchema from "../../schemas/NewSession.schema";

interface NewSessionForm {
  onSubmit: (data: NewSession) => Promise<void>;
}

export default function NewSessionForm({ onSubmit }: NewSessionForm) {
  const { register, handleSubmit, errors } = useForm<NewSession>({
    mode: "onChange",
    resolver: yupResolver(NewSessionSchema),
  });

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

      <FormField label="Title of Input" error={errors.valueTitle?.message}>
        <input
          className="input"
          type="text"
          name="valueTitle"
          defaultValue=""
          placeholder=""
          ref={register()}
        />
      </FormField>

      <FormField>
        <input type="submit" className="button is-link" />
      </FormField>
    </form>
  );
}
