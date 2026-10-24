"use client";

import { useActionState } from "react";
import { ListingForm } from "@/components/feature/listing-form";
import {
  updateListingAction,
  type ListingActionState,
} from "@/actions/listings";
import type { CategoryDTO } from "@/types";

const initialState: ListingActionState = {};

export function EditListingForm({
  listingId,
  categories,
  initial,
}: {
  listingId: string;
  categories: CategoryDTO[];
  initial: React.ComponentProps<
    typeof ListingForm
  >["initial"];
}): React.ReactNode {
  const bound = updateListingAction.bind(null, listingId);
  const [state, formAction, isPending] = useActionState(
    bound,
    initialState,
  );
  return (
    <ListingForm
      categories={categories}
      action={formAction}
      state={state}
      isPending={isPending}
      submitLabel="সংরক্ষণ করুন"
      initial={initial}
    />
  );
}
