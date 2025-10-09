import * as ExcelJS from 'exceljs';

export interface ParsedTeacherData {
  name: string;
  email: string;
  username: string;
  phone: string;
  gender: string;
  birthDate: string;
  role: string;
  schoolName: string;
  schoolAddress?: string;
  contractImageBlob?: Blob;
  notes?: string;
}

export class ExcelParserService {
  /**
   * Parse Excel file và extract ảnh từ các cell
   */
  static async parseTeachersExcel(file: File): Promise<ParsedTeacherData[]> {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    const teachers: ParsedTeacherData[] = [];

    // Lấy thông tin về ảnh trong worksheet
    const images = worksheet.getImages();
    
    console.log(`Found ${images.length} images in Excel`);
    
    // Map để lưu ảnh theo row
    const imagesByRow = new Map<number, Blob>();

    // Extract tất cả ảnh
    for (const image of images) {
      console.log('Image object:', image);
      const mediaIndex = Number(image.imageId);
      const img = workbook.model.media?.[mediaIndex];
      
      // Kiểm tra image có range hợp lệ không
      if (!img || !image.range?.tl || !image.range?.br) {
        console.warn('Image missing range information. Has img:', !!img, 'Has range:', !!image.range);
        
        // Thử cách khác: Nếu không có range, gán ảnh cho row 2 (dòng dữ liệu đầu tiên)
        if (img && images.length === 1) {
          console.log('Only one image found, assigning to row 2');
          const extension = img.extension.toLowerCase();
          const blob = new Blob([img.buffer], { type: `image/${extension}` });
          imagesByRow.set(2, blob);
        }
        continue;
      }
      
      // Kiểm tra định dạng ảnh hợp lệ
      const validExtensions = ['jpeg', 'jpg', 'png', 'gif'];
      const extension = img.extension.toLowerCase();
      
      if (!validExtensions.includes(extension)) {
        console.warn(`Invalid image format: ${img.extension}. Only JPG, PNG, GIF are allowed.`);
        continue; // Bỏ qua ảnh không hợp lệ
      }
      
      // Debug: In ra thông tin chi tiết về vị trí ảnh
      console.log('Image range:', {
        tl: { row: image.range.tl.row, col: image.range.tl.col, nativeRow: image.range.tl.nativeRow, nativeCol: image.range.tl.nativeCol },
        br: { row: image.range.br.row, col: image.range.br.col, nativeRow: image.range.br.nativeRow, nativeCol: image.range.br.nativeCol }
      });
      
      // Thử nhiều cách tính row
      const rowOption1 = (image.range.tl.row || 0) + 1;
      const rowOption2 = (image.range.tl.nativeRow || 0) + 1;
      const rowOption3 = Math.floor(((image.range.tl.row || 0) + (image.range.br.row || 0)) / 2) + 1;
      
      console.log(`Row calculations: opt1=${rowOption1}, opt2=${rowOption2}, opt3=${rowOption3}`);
      
      // Sử dụng row từ range (thường là nativeRow)
      const row = (image.range.tl.nativeRow || image.range.tl.row || 0) + 1;
      
      console.log(`Image found at row ${row}, extension: ${extension}, size: ${(img.buffer as any)?.length || 0} bytes`);
      
      // Convert buffer to Blob
      const blob = new Blob([img.buffer], { type: `image/${extension}` });
      imagesByRow.set(row, blob);
    }
    
    console.log('Images by row:', Array.from(imagesByRow.keys()));

    // Parse từng row (bỏ qua header row 1)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const teacher: ParsedTeacherData = {
        name: this.getCellValue(row.getCell(1)), // Column A
        email: this.getCellValue(row.getCell(2)), // Column B
        username: this.getCellValue(row.getCell(3)), // Column C
        phone: this.getCellValue(row.getCell(4)), // Column D
        gender: this.getCellValue(row.getCell(5)), // Column E
        birthDate: this.getCellValue(row.getCell(6)), // Column F
        role: this.getCellValue(row.getCell(7)) || 'teacher', // Column G
        schoolName: this.getCellValue(row.getCell(8)), // Column H
        schoolAddress: this.getCellValue(row.getCell(9)), // Column I
        // Column J: URL ảnh hoặc ảnh nhúng
        notes: this.getCellValue(row.getCell(11)), // Column K
      };
      
      // Kiểm tra cột J có URL ảnh không
      const contractImageValue = this.getCellValue(row.getCell(10)); // Column J
      if (contractImageValue && contractImageValue.startsWith('http')) {
        // Nếu là URL, lưu vào contractImageUrl
        (teacher as any).contractImageUrl = contractImageValue;
      }

      // Gắn ảnh nếu có
      if (imagesByRow.has(rowNumber)) {
        teacher.contractImageBlob = imagesByRow.get(rowNumber);
        console.log(`Row ${rowNumber} (${teacher.name}): Image attached`);
      } else {
        console.log(`Row ${rowNumber} (${teacher.name}): No image found`);
      }

      // Chỉ thêm nếu có thông tin cơ bản
      if (teacher.name && teacher.email && teacher.username) {
        teachers.push(teacher);
      }
    });
    
    console.log(`Parsed ${teachers.length} teachers, ${Array.from(imagesByRow.keys()).length} images`);

    return teachers;
  }

  private static getCellValue(cell: ExcelJS.Cell): string {
    if (!cell || cell.value === null || cell.value === undefined) {
      return '';
    }

    // Handle different cell types
    if (typeof cell.value === 'object') {
      if ('text' in cell.value) {
        return cell.value.text.toString();
      }
      if ('richText' in cell.value) {
        return cell.value.richText.map((rt: any) => rt.text).join('');
      }
      if (cell.value instanceof Date) {
        // Format date as DD/MM/YYYY
        const date = cell.value;
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }
    }

    return cell.value.toString().trim();
  }

  /**
   * Convert Blob to File
   */
  static blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, { type: blob.type });
  }

  /**
   * Generate Excel template with sample data
   */
  static async generateTemplate(): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Teachers');

    // Add header row
    worksheet.columns = [
      { header: 'Tên', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Tên đăng nhập', key: 'username', width: 20 },
      { header: 'Số điện thoại', key: 'phone', width: 15 },
      { header: 'Giới tính', key: 'gender', width: 12 },
      { header: 'Ngày sinh', key: 'birthDate', width: 15 },
      { header: 'Nhóm quyền', key: 'role', width: 15 },
      { header: 'Tên trường', key: 'schoolName', width: 30 },
      { header: 'Địa chỉ trường', key: 'schoolAddress', width: 40 },
      { header: 'Ảnh hợp đồng', key: 'contractImage', width: 20 },
      { header: 'Ghi chú', key: 'notes', width: 30 },
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Add sample data
    worksheet.addRow({
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      username: 'nguyenvana',
      phone: '0123456789',
      gender: 'MALE',
      birthDate: '01/01/1990',
      role: 'teacher',
      schoolName: 'THPT Nguyễn Huệ',
      schoolAddress: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      contractImage: '[Nhúng ảnh vào đây]',
      notes: 'Giáo viên Toán',
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }
}