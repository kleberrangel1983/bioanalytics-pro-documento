export type ClinicalDraft = {
  content: string
  reviewedByDoctor: boolean
  reviewedAtIso?: string
}

export function canPersistClinicalDraft(draft: ClinicalDraft): boolean {
  return draft.reviewedByDoctor === true
}

export function markDraftReviewedByDoctor(
  draft: ClinicalDraft,
  reviewedAtIso: string,
): ClinicalDraft {
  return {
    ...draft,
    reviewedByDoctor: true,
    reviewedAtIso,
  }
}
