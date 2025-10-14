// Enum cho các khối lớp
export enum GradeLevel {
  GRADE_6 = '6', 
  GRADE_7 = '7',
  GRADE_8 = '8',
  GRADE_9 = '9'
}

// Constant object với thông tin chi tiết các khối lớp
export const GRADE_LEVELS = {
 
  [GradeLevel.GRADE_6]: {
    value: '6',
    label: 'Khối 6', 
    description: 'Lớp 6',

  },
  [GradeLevel.GRADE_7]: {
    value: '7',
    label: 'Khối 7',
    description: 'Lớp 7', 

  },
  [GradeLevel.GRADE_8]: {
    value: '8',
    label: 'Khối 8',
    description: 'Lớp 8',

  },
  [GradeLevel.GRADE_9]: {
    value: '9',
    label: 'Khối 9',
    description: 'Lớp 9',

  }
} as const;

// Array để dễ dàng iterate
export const GRADE_LEVEL_OPTIONS = Object.values(GRADE_LEVELS).map(grade => ({
  value: grade.value,
  label: grade.label,
  description: grade.description,

}));

// Helper functions
export const getGradeInfo = (gradeValue: string) => {
  return GRADE_LEVELS[gradeValue as GradeLevel] || null;
};

export const getGradeLabel = (gradeValue: string) => {
  const gradeInfo = getGradeInfo(gradeValue);
  return gradeInfo?.label || gradeValue;
};


