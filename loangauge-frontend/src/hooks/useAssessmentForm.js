import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { assessmentSchema } from "../validators/assessmentValidators";
import {
  useGetLoanTypesQuery,
  useCreateAssessmentMutation,
} from "../services/assessmentService";

export function useAssessmentForm() {
  const navigate = useNavigate();
  const { data: loanTypes = [], isLoading: loadingLoanTypes } =
    useGetLoanTypesQuery();
  const [createAssessment, { isLoading: submitting }] =
    useCreateAssessmentMutation();

  const form = useForm({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      loanTypeId: "",
      loanAmount: "",
      tenureMonths: "",
      interestRate: "",
    },
  });

  const onSubmit = async (values) => {
    try {
      const result = await createAssessment(values).unwrap();
      toast.success("Assessment complete");
      // pass the result to the result page via router state
      navigate("/assessment/result", { state: { assessment: result } });
    } catch (err) {
      // backend returns ApiError { message } — surface loan-type validation errors etc.
      toast.error(err?.data?.message || "Assessment failed");
    }
  };

  return { form, loanTypes, loadingLoanTypes, submitting, onSubmit };
}
