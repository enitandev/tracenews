import React from 'react';
import VerdictCard from '../components/MonitoringSpirit/VerdictCard';

export default function TestVerdict() {
  const clearData = {
    verdict: 'clear',
    snapshots: [
      { snapshot_at: new Date(Date.now() - 3600000 * 36).toISOString(), coverage_tier_distribution: { govt_aligned: 2, mainstream: 4, watchdog: 3 } },
      { snapshot_at: new Date(Date.now() - 3600000 * 24).toISOString(), coverage_tier_distribution: { govt_aligned: 3, mainstream: 6, watchdog: 4 } },
      { snapshot_at: new Date(Date.now() - 3600000 * 12).toISOString(), coverage_tier_distribution: { govt_aligned: 3, mainstream: 7, watchdog: 5 } },
      { snapshot_at: new Date().toISOString(), coverage_tier_distribution: { govt_aligned: 4, mainstream: 8, watchdog: 6 } }
    ]
  };

  const mixedData = {
    verdict: 'mixed',
    evidence: [{ type: 'churnalism' }],
    snapshots: [
      { snapshot_at: new Date(Date.now() - 3600000 * 36).toISOString(), coverage_tier_distribution: { govt_aligned: 1, mainstream: 3, watchdog: 1 } },
      { snapshot_at: new Date(Date.now() - 3600000 * 24).toISOString(), coverage_tier_distribution: { govt_aligned: 2, mainstream: 5, watchdog: 2 } },
      { snapshot_at: new Date(Date.now() - 3600000 * 12).toISOString(), coverage_tier_distribution: { govt_aligned: 3, mainstream: 7, watchdog: 3 } },
      { snapshot_at: new Date().toISOString(), coverage_tier_distribution: { govt_aligned: 3, mainstream: 8, watchdog: 3 } }
    ]
  };

  const darkData = {
    verdict: 'dark',
    snapshots: [
      { snapshot_at: new Date(Date.now() - 3600000 * 36).toISOString(), coverage_tier_distribution: { govt_aligned: 0, mainstream: 0, watchdog: 4 } },
      { snapshot_at: new Date(Date.now() - 3600000 * 24).toISOString(), coverage_tier_distribution: { govt_aligned: 0, mainstream: 0, watchdog: 5 } },
      { snapshot_at: new Date(Date.now() - 3600000 * 12).toISOString(), coverage_tier_distribution: { govt_aligned: 0, mainstream: 1, watchdog: 6 } },
      { snapshot_at: new Date().toISOString(), coverage_tier_distribution: { govt_aligned: 0, mainstream: 1, watchdog: 7 } }
    ]
  };

  const clearStories = [
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 80, outlet_name: 'Daily Trust' },
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 80, outlet_name: 'The Nation' },
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 20, outlet_name: 'New Telegraph' },
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 20, outlet_name: 'Blueprint' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'Punch' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'Vanguard' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'The Guardian' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'ThisDay' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'Tribune' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'BusinessDay' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'Daily Post' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'PM News' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'Premium Times' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'Sahara Reporters' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'TheCable' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'HumAngle' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'ICIR' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 20, outlet_name: 'Peoples Gazette' },
  ];

  const mixedStories = [
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 20, outlet_name: 'Daily Trust' },
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 20, outlet_name: 'The Nation' },
    { outlet_coverage_tier: 'govt_aligned', outlet_s2_score: 20, outlet_name: 'Blueprint' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'Punch' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'Vanguard' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'Sun' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'Leadership' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'ThisDay' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'Tribune' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'Daily Post' },
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 20, outlet_name: 'PM News' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'Premium Times' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'TheCable' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 20, outlet_name: 'Daily Nigerian' },
  ];

  const darkStories = [
    { outlet_coverage_tier: 'mainstream', outlet_s2_score: 80, outlet_name: 'The Guardian' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'Sahara Reporters' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'Premium Times' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'TheCable' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'HumAngle' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'ICIR' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 80, outlet_name: 'Peoples Gazette' },
    { outlet_coverage_tier: 'watchdog', outlet_s2_score: 20, outlet_name: 'Daily Nigerian' },
  ];

  // Mirror the by-slug payload: one outlet per row, republish status from the
  // backend's s2 bands (< 40 republisher, >= 50 original).
  const asPayload = (stories) => stories.map(s => ({
    ...s,
    outlet_id: s.outlet_name,
    outlet_republishes: s.outlet_s2_score < 40 ? true : s.outlet_s2_score >= 50 ? false : null,
  }));

  return (
    <div style={{ background: '#0d0e10', padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <VerdictCard verdictData={clearData} clusterStories={asPayload(clearStories)} />
      <VerdictCard verdictData={mixedData} clusterStories={asPayload(mixedStories)} />
      {/* Zero tier in a past check: hatched ghost + none mark in the timeline */}
      <VerdictCard verdictData={{ ...clearData, snapshots: [{ snapshot_at: new Date(Date.now() - 3600000 * 30).toISOString(), coverage_tier_distribution: { govt_aligned: 0, mainstream: 3, watchdog: 2 } }, ...clearData.snapshots.slice(2)] }} clusterStories={asPayload(clearStories)} />
      {/* DARK: must render nothing while DARK_ENABLED is false */}
      <VerdictCard verdictData={darkData} clusterStories={asPayload(darkStories)} />
    </div>
  );
}
