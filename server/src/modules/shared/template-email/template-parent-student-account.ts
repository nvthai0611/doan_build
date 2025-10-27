
export function templateParentStudentAccount(
  parent: { fullName: string; username: string; email: string; password: string },
  students: Array<{ fullName: string; username: string; email: string; password: string }>
) {
  return `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Thông tin tài khoản QNE</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0f4f8;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0f4f8; padding: 20px 0;">
        <tr>
          <td align="center">
            <!--[if mso]>
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff;">
            <![endif]-->
            <!--[if !mso]><!-->
            <table border="0" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden;">
            <!--<![endif]-->
              
              <!-- Decorative Top Bar -->
              <tr>
                <td bgcolor="#667EEA" height="8"></td>
              </tr>
              
              <!-- Header with Icon -->
              <tr>
                <td bgcolor="#667EEA" style="padding: 45px 30px 35px 30px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" bgcolor="#FFFFFF" width="64" height="64" style="border: 4px solid rgba(255,255,255,0.3);">
                              <span style="color: #667EEA; font-size: 32px; font-family: Arial, sans-serif; font-weight: bold; line-height: 64px;">Q</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 20px;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; font-family: Arial, sans-serif; letter-spacing: -0.5px;">
                          Chào mừng đến với QNE
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top: 8px;">
                        <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 15px; font-family: Arial, sans-serif;">
                          Tài khoản của bạn đã được kích hoạt thành công
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 45px 35px 40px 35px;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    
                    <!-- Greeting -->
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px 0; color: #1a202c; font-size: 16px; font-family: Arial, sans-serif; line-height: 24px;">
                          Xin chào <strong style="color: #667EEA;">${parent.fullName}</strong>,
                        </p>
                        <p style="margin: 0 0 35px 0; color: #4a5568; font-size: 15px; font-family: Arial, sans-serif; line-height: 23px;">
                          Chúng tôi rất vui được chào đón bạn. Dưới đây là thông tin đăng nhập cho tài khoản phụ huynh và các tài khoản học sinh liên quan.
                        </p>
                      </td>
                    </tr>
                    
                    <!-- Parent Account Section -->
                    <tr>
                      <td>
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#F7FAFC" style="border: 2px solid #E2E8F0;">
                          <tr>
                            <td style="padding: 25px 25px 20px 25px;">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td>
                                    <table border="0" cellpadding="0" cellspacing="0">
                                      <tr>
                                        <td bgcolor="#667EEA" width="4" style="padding: 0;"></td>
                                        <td style="padding-left: 12px;">
                                          <h2 style="margin: 0; color: #2d3748; font-size: 18px; font-family: Arial, sans-serif; font-weight: bold;">
                                            👤 Tài khoản phụ huynh
                                          </h2>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding-top: 20px;">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                        <td width="110" style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #718096; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">Họ tên</span>
                                        </td>
                                        <td style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #2d3748; font-size: 14px; font-family: Arial, sans-serif;">${parent.fullName}</span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#E2E8F0" height="1" colspan="2"></td>
                                      </tr>
                                      <tr>
                                        <td width="110" style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #718096; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">Tài khoản</span>
                                        </td>
                                        <td style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #2d3748; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">${parent.username}</span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#E2E8F0" height="1" colspan="2"></td>
                                      </tr>
                                      <tr>
                                        <td width="110" style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #718096; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">Email</span>
                                        </td>
                                        <td style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #667EEA; font-size: 14px; font-family: Arial, sans-serif;">${parent.email}</span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td bgcolor="#E2E8F0" height="1" colspan="2"></td>
                                      </tr>
                                      <tr>
                                        <td width="110" style="padding: 10px 0; vertical-align: top;">
                                          <span style="color: #718096; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">Mật khẩu</span>
                                        </td>
                                        <td style="padding: 10px 0; vertical-align: top;">
                                          <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                              <td bgcolor="#FFFFFF" style="padding: 8px 14px; border: 1px solid #CBD5E0;">
                                                <span style="color: #2d3748; font-size: 15px; font-family: 'Courier New', Courier, monospace; font-weight: bold; letter-spacing: 1px;">${parent.password}</span>
                                              </td>
                                            </tr>
                                          </table>
                                        </td>
                                      </tr>
                                    </table>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Students Section Header -->
                    <tr>
                      <td style="padding-top: 40px;">
                        <table border="0" cellpadding="0" cellspacing="0">
                          <tr>
                            <td bgcolor="#667EEA" width="4" style="padding: 0;"></td>
                            <td style="padding-left: 12px;">
                              <h2 style="margin: 0; color: #2d3748; font-size: 18px; font-family: Arial, sans-serif; font-weight: bold;">
                                👨‍🎓 Tài khoản học sinh
                              </h2>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Students Table -->
                    <tr>
                      <td style="padding-top: 20px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 2px solid #E2E8F0;">
                          <!-- Table Header -->
                          <tr bgcolor="#667EEA">
                            <td align="center" width="50" style="padding: 14px 8px; border-right: 1px solid rgba(255,255,255,0.2);">
                              <span style="color: #ffffff; font-size: 13px; font-family: Arial, sans-serif; font-weight: bold;">STT</span>
                            </td>
                            <td style="padding: 14px 12px; border-right: 1px solid rgba(255,255,255,0.2);">
                              <span style="color: #ffffff; font-size: 13px; font-family: Arial, sans-serif; font-weight: bold;">Họ tên</span>
                            </td>
                            <td style="padding: 14px 12px; border-right: 1px solid rgba(255,255,255,0.2);">
                              <span style="color: #ffffff; font-size: 13px; font-family: Arial, sans-serif; font-weight: bold;">Tài khoản</span>
                            </td>
                            <td style="padding: 14px 12px; border-right: 1px solid rgba(255,255,255,0.2);">
                              <span style="color: #ffffff; font-size: 13px; font-family: Arial, sans-serif; font-weight: bold;">Email</span>
                            </td>
                            <td style="padding: 14px 12px;">
                              <span style="color: #ffffff; font-size: 13px; font-family: Arial, sans-serif; font-weight: bold;">Mật khẩu</span>
                            </td>
                          </tr>
                          <!-- Table Rows -->
                          ${students
                            .map(
                              (s, idx) => `
                          <tr bgcolor="${idx % 2 === 0 ? '#FFFFFF' : '#F7FAFC'}">
                            <td align="center" width="50" style="padding: 12px 8px; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                              <span style="color: #667EEA; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">${idx + 1}</span>
                            </td>
                            <td style="padding: 12px 12px; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                              <span style="color: #2d3748; font-size: 14px; font-family: Arial, sans-serif;">${s.fullName}</span>
                            </td>
                            <td style="padding: 12px 12px; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                              <span style="color: #2d3748; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">${s.username}</span>
                            </td>
                            <td style="padding: 12px 12px; border-top: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0;">
                              <span style="color: #667EEA; font-size: 13px; font-family: Arial, sans-serif;">${s.email}</span>
                            </td>
                            <td style="padding: 12px 12px; border-top: 1px solid #E2E8F0;">
                              <span style="color: #2d3748; font-size: 13px; font-family: 'Courier New', Courier, monospace; font-weight: bold; letter-spacing: 0.5px;">${s.password}</span>
                            </td>
                          </tr>
                          `
                            )
                            .join('')}
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Security Notice -->
                    <tr>
                      <td style="padding-top: 35px;">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#FFF9E6" style="border-left: 4px solid #F6AD55;">
                          <tr>
                            <td style="padding: 18px 20px;">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td width="30" valign="top">
                                    <span style="font-size: 20px;">🔒</span>
                                  </td>
                                  <td>
                                    <p style="margin: 0; color: #744210; font-size: 14px; font-family: Arial, sans-serif; line-height: 21px;">
                                      <strong>Lưu ý bảo mật:</strong> Vui lòng đăng nhập và đổi mật khẩu ngay sau lần sử dụng đầu tiên để đảm bảo an toàn cho tài khoản của bạn.
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Closing -->
                    <tr>
                      <td style="padding-top: 35px;">
                        <p style="margin: 0; color: #4a5568; font-size: 15px; font-family: Arial, sans-serif; line-height: 23px;">
                          Nếu bạn có bất kỳ thắc mắc nào, đừng ngần ngại liên hệ với chúng tôi.
                        </p>
                        <p style="margin: 20px 0 0 0; color: #4a5568; font-size: 15px; font-family: Arial, sans-serif; line-height: 23px;">
                          Trân trọng,<br/>
                          <strong style="color: #667EEA;">Đội ngũ QNE</strong>
                        </p>
                      </td>
                    </tr>
                    
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td bgcolor="#F7FAFC" style="padding: 30px 35px; border-top: 1px solid #E2E8F0;">
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 8px 0; color: #a0aec0; font-size: 12px; font-family: Arial, sans-serif; line-height: 18px;">
                          Email này được gửi tự động từ hệ thống QNE
                        </p>
                        <p style="margin: 0; color: #cbd5e0; font-size: 11px; font-family: Arial, sans-serif; line-height: 16px;">
                          © 2025 QNE. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Bottom Decorative Bar -->
              <tr>
                <td bgcolor="#667EEA" height="6"></td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}