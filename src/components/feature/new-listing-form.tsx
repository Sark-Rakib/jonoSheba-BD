"use client";

import { useActionState } from "react";
import { ListingForm } from "@/components/feature/listing-form";
import {
  createListingAction,
  type ListingActionState,
} from "@/actions/listings";
import type { CategoryDTO } from "@/types";

const initialState: ListingActionState = {};

export function NewListingForm({
  categories,
}: {
  categories: CategoryDTO[];
}): React.ReactNode {
  const [state, formAction, isPending] = useActionState(
    createListingAction,
    initialState,
  );
  return (
    <ListingForm
      categories={categories}
      action={formAction}
      state={state}
      isPending={isPending}
      submitLabel="অনুমোদনের জন্য পাঠান"
    />
  );
}
