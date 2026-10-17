/**
 * Keys of the shared `pillars` namespace, built from the pillar modules so a new pillar only adds
 * translations (RF-23). Today and Week name pillars and answers with the same texts; each screen
 * has a test that checks the keys of every pillar against the English file (G5.3).
 */
export const pillarKey = {
  name: (pillar: string) => `pillars:${pillar}.name`,
  field: (pillar: string, field: string) => `pillars:${pillar}.fields.${field}`,
  option: (pillar: string, field: string, option: string) =>
    `pillars:${pillar}.options.${field}.${option}`,
  scaleValue: (pillar: string, field: string, value: number) =>
    `pillars:${pillar}.scale.${field}.${value}`,
  shortUnit: (unit: string) => `pillars:shortUnits.${unit}`,
  unit: (unit: string) => `pillars:units.${unit}`,
  yes: 'pillars:answers.yes',
  no: 'pillars:answers.no',
};
