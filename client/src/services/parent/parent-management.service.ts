import axios from 'axios';

const API_BASE = 'http://localhost:3000/api'; // Adjust based on your backend URL

/**
 * Parent Management API Services
 */

// ========== 1. TẠO PHỤ HUYNH KÈMM HỌC SINH ==========

/**
 * Tạo phụ huynh mới cùng với nhiều học sinh
 * @param parentData - Thông tin phụ huynh
 * @param students - Danh sách học sinh
 */
export async function createParentWithStudents(
  parentData: {
    username: string;
    password: string;
    email: string;
    fullName: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
  },
  students: Array<{
    fullName: string;
    email: string;
    studentCode?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    schoolId: string;
  }>
) {
  try {
    const response = await axios.post(
      `${API_BASE}/parent-management/with-students`,
      {
        ...parentData,
        students
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating parent with students:', error);
    throw error;
  }
}

// ========== 2. THÊM HỌC SINH MỚI CHO PHỤ HUYNH ĐÃ TỒN TẠI ==========

/**
 * Thêm học sinh mới cho phụ huynh đã tồn tại
 * @param parentId - ID của phụ huynh
 * @param studentData - Thông tin học sinh
 */
export async function addStudentToParent(
  parentId: string,
  studentData: {
    fullName: string;
    email: string;
    studentCode?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
    address?: string;
    grade?: string;
    schoolId: string;
    password?: string;
  }
) {
  try {
    const response = await axios.post(
      `${API_BASE}/parent-management/${parentId}/add-student`,
      studentData
    );
    return response.data;
  } catch (error) {
    console.error('Error adding student to parent:', error);
    throw error;
  }
}

// ========== 3. LIÊN KẾT HỌC SINH ĐÃ TỒN TẠI ==========

/**
 * Liên kết học sinh đã tồn tại với phụ huynh
 * @param parentId - ID của phụ huynh
 * @param studentId - ID của học sinh
 */
export async function linkStudentToParent(
  parentId: string,
  studentId: string
) {
  try {
    const response = await axios.post(
      `${API_BASE}/parent-management/${parentId}/students`,
      { studentId }
    );
    return response.data;
  } catch (error) {
    console.error('Error linking student to parent:', error);
    throw error;
  }
}

// ========== 4. HỦY LIÊN KẾT HỌC SINH ==========

/**
 * Hủy liên kết học sinh khỏi phụ huynh
 * @param parentId - ID của phụ huynh
 * @param studentId - ID của học sinh
 */
export async function unlinkStudentFromParent(
  parentId: string,
  studentId: string
) {
  try {
    const response = await axios.delete(
      `${API_BASE}/parent-management/${parentId}/students/${studentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error unlinking student from parent:', error);
    throw error;
  }
}

// ========== 5. CÁC ENDPOINTS LIÊN QUAN ==========

/**
 * Tạo phụ huynh mà không có học sinh
 */
export async function createParent(parentData: {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  birthDate?: string;
}) {
  try {
    const response = await axios.post(
      `${API_BASE}/parent-management`,
      parentData
    );
    return response.data;
  } catch (error) {
    console.error('Error creating parent:', error);
    throw error;
  }
}

/**
 * Lấy danh sách phụ huynh
 */
export async function getAllParents(
  page: number = 1,
  limit: number = 10,
  search?: string,
  isActive?: boolean
) {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (isActive !== undefined) params.append('isActive', isActive.toString());

    const response = await axios.get(
      `${API_BASE}/parent-management?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting parents:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết phụ huynh
 */
export async function getParentById(parentId: string) {
  try {
    const response = await axios.get(
      `${API_BASE}/parent-management/${parentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting parent:', error);
    throw error;
  }
}

/**
 * Cập nhật thông tin phụ huynh
 */
export async function updateParent(
  parentId: string,
  updateData: {
    fullName?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    birthDate?: string;
  }
) {
  try {
    const response = await axios.put(
      `${API_BASE}/parent-management/${parentId}`,
      updateData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating parent:', error);
    throw error;
  }
}

/**
 * Toggle trạng thái active của phụ huynh
 */
export async function toggleParentStatus(parentId: string) {
  try {
    const response = await axios.patch(
      `${API_BASE}/parent-management/${parentId}/toggle-status`
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling parent status:', error);
    throw error;
  }
}

/**
 * Tìm học sinh theo mã
 */
export async function findStudentByCode(studentCode: string) {
  try {
    const response = await axios.get(
      `${API_BASE}/parent-management/search-student?studentCode=${studentCode}`
    );
    return response.data;
  } catch (error) {
    console.error('Error finding student:', error);
    throw error;
  }
}

/**
 * Đếm phụ huynh theo trạng thái
 */
export async function getParentCountByStatus() {
  try {
    const response = await axios.get(
      `${API_BASE}/parent-management/count-status`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting count by status:', error);
    throw error;
  }
}

// ========== EXAMPLES / USAGE ==========

/**
 * Ví dụ 1: Tạo phụ huynh với 2 học sinh cùng lúc
 */
export async function exampleCreateParentWithMultipleStudents() {
  try {
    const result = await createParentWithStudents(
      {
        username: 'nguyenthihuyen',
        password: 'MyPassword123',
        email: 'huyen@example.com',
        fullName: 'Nguyễn Thị Huyền',
        phone: '09123456789',
        gender: 'FEMALE',
        birthDate: '1985-05-15'
      },
      [
        {
          fullName: 'Nguyễn Ngọc Long',
          email: 'long@example.com',
          studentCode: 'STU-2024-001',
          phone: '09987654321',
          gender: 'MALE',
          birthDate: '2008-03-20',
          address: '123 Đường ABC, Quận 1',
          grade: '12A1',
          schoolId: 'school-uuid-1'
        },
        {
          fullName: 'Nguyễn Ngọc Hân',
          email: 'han@example.com',
          studentCode: 'STU-2024-002',
          phone: '09876543210',
          gender: 'FEMALE',
          birthDate: '2010-07-10',
          address: '123 Đường ABC, Quận 1',
          grade: '10A2',
          schoolId: 'school-uuid-1'
        }
      ]
    );

    console.log('Parent created with students:', result);
    return result;
  } catch (error) {
    console.error('Failed to create parent with students:', error);
  }
}

/**
 * Ví dụ 2: Thêm học sinh mới cho phụ huynh đã tồn tại
 */
export async function exampleAddStudentToExistingParent(parentId: string) {
  try {
    const result = await addStudentToParent(parentId, {
      fullName: 'Nguyễn Ngọc Minh',
      email: 'minh@example.com',
      studentCode: 'STU-2024-003',
      phone: '09111111111',
      gender: 'MALE',
      birthDate: '2009-11-08',
      address: '123 Đường ABC, Quận 1',
      grade: '11A3',
      schoolId: 'school-uuid-1'
    });

    console.log('Student added to parent:', result);
    return result;
  } catch (error) {
    console.error('Failed to add student:', error);
  }
}

/**
 * Ví dụ 3: Liên kết học sinh đã tồn tại
 */
export async function exampleLinkExistingStudent(
  parentId: string,
  studentId: string
) {
  try {
    const result = await linkStudentToParent(parentId, studentId);
    console.log('Student linked to parent:', result);
    return result;
  } catch (error) {
    console.error('Failed to link student:', error);
  }
}

/**
 * Ví dụ 4: Hủy liên kết học sinh
 */
export async function exampleUnlinkStudent(
  parentId: string,
  studentId: string
) {
  try {
    const result = await unlinkStudentFromParent(parentId, studentId);
    console.log('Student unlinked from parent:', result);
    return result;
  } catch (error) {
    console.error('Failed to unlink student:', error);
  }
}

/**
 * Ví dụ 5: Lấy danh sách phụ huynh
 */
export async function exampleGetAllParents() {
  try {
    const result = await getAllParents(
      1, // page
      10, // limit
      'Nguyễn', // search by name
      true // active only
    );
    console.log('Parents list:', result);
    return result;
  } catch (error) {
    console.error('Failed to get parents:', error);
  }
}

/**
 * Ví dụ 6: Lấy chi tiết phụ huynh và các học sinh
 */
export async function exampleGetParentDetails(parentId: string) {
  try {
    const result = await getParentById(parentId);
    console.log('Parent details:', result);
    console.log('Number of students:', result.data.studentCount);
    console.log('Student list:', result.data.students);
    return result;
  } catch (error) {
    console.error('Failed to get parent details:', error);
  }
}
