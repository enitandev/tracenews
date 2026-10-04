import LegalDocument from '../legal/LegalDocument';
import source from '../legal/terms-of-use-v1.0.md?raw';

export default function Terms() {
  return (
    <LegalDocument source={source} title="Terms of Use" path="/terms"
      description="The terms for using TraceNews at tracenews.ng." />
  );
}
