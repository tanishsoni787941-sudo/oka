export interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  pdfEnglish: string;
  pdfHindi: string;
  status: 'active' | 'coming_soon';
  order: number;
}

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'Mushroom Training Online Course',
    videoUrl: 'https://drive.google.com/file/d/1t4CVmAtS6SVOxewXhq-zY69BJuE0m30Y/preview',
    pdfEnglish: 'https://docs.google.com/document/d/1SQuzj_dGlLClISSywYx7CfAGC6-jsOuPLPS2VBi04-k/edit',
    pdfHindi: 'https://docs.google.com/document/d/1-B86jDfaHPGMVXgnB4pUbITnI0B9mgy9gaCYEzLTGl4/edit',
    status: 'active',
    order: 1
  },
  {
    id: 'lesson-2',
    title: 'Button Mushroom Full Cultivation Process',
    videoUrl: 'https://drive.google.com/file/d/1lSPWvPU33n9eRRzjS2kER07cZYtzetID/preview',
    pdfEnglish: 'https://docs.google.com/document/d/10O9X2Dz7rr3tiFLcsNxEjhBJ4c_voBi35CB4iaVxcNA/edit',
    pdfHindi: 'https://docs.google.com/document/d/1-deLiorpAHZ0K4VKU0GEo7z0-SG0KzO94Dym9WQlnfc/edit',
    status: 'active',
    order: 2
  },
  {
    id: 'lesson-3',
    title: 'Oyster Mushroom Full Cultivation Process',
    videoUrl: 'https://drive.google.com/file/d/1mUEaQX_m5Cn0rhiE2px5Yr894XZ40gsr/preview',
    pdfEnglish: 'https://docs.google.com/document/d/10zKIme_lLJIeEz8rF3kTpk3U1SpXTjaPCAKF6gyRlgg',
    pdfHindi: 'https://docs.google.com/document/d/111ejEhBsZKFH66f97Ke2CliFIxecScYZiyD-gJYdCsE/edit',
    status: 'active',
    order: 3
  },
  {
    id: 'lesson-4',
    title: 'Advanced Mushroom Farming Guide',
    videoUrl: '', // To be filled if needed, or left empty for coming soon
    pdfEnglish: 'https://docs.google.com/document/d/11ZraZgj3OSIy03xTvhprZe5RFhsiGBz7IxnmzW9Cxtw/edit',
    pdfHindi: 'https://docs.google.com/document/d/11E-cE1JSN_gEmjT6QT2gxND1lAqP9O-t45YQi-aKvYs/edit',
    status: 'coming_soon',
    order: 4
  }
];
