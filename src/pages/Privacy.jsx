import LegalDocument from '../legal/LegalDocument';
import source from '../legal/privacy-policy-v1.0.md?raw';

export default function Privacy() {
  return (
    <LegalDocument source={source} title="Privacy Policy" path="/privacy"
      description="What personal information TraceNews collects, why, who sees it, how long we keep it, and your rights." />
  );
}
