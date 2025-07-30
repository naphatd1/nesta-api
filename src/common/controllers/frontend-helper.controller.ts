import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Frontend Helper')
@Controller('frontend')
export class FrontendHelperController {
  @Get('error-message')
  @ApiOperation({ summary: 'Get specific error message for frontend display' })
  @ApiQuery({ name: 'type', description: 'Error type (login, register, validation)', required: true })
  @ApiQuery({ name: 'field', description: 'Field name (email, password, name)', required: false })
  @ApiQuery({ name: 'code', description: 'Error code', required: false })
  @ApiResponse({ status: 200, description: 'Error message retrieved' })
  getErrorMessage(
    @Query('type') type: string,
    @Query('field') field?: string,
    @Query('code') code?: string
  ) {
    const errorMessages = {
      login: {
        email: {
          invalid: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com',
          notFound: 'ไม่พบบัญชีผู้ใช้งานที่ตรงกับอีเมลนี้ กรุณาตรวจสอบอีเมลอีกครั้งหรือสมัครสมาชิกใหม่',
          empty: 'กรุณากรอกที่อยู่อีเมลของคุณ'
        },
        password: {
          wrong: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง',
          empty: 'กรุณากรอกรหัสผ่านของคุณ'
        },
        general: {
          unauthorized: 'การเข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน',
          accountSuspended: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
          tooManyAttempts: 'คุณพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่'
        }
      },
      register: {
        email: {
          invalid: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com',
          exists: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาลองใช้อีเมลอื่นหรือเข้าสู่ระบบหากคุณมีบัญชีอยู่แล้ว',
          empty: 'กรุณากรอกที่อยู่อีเมลของคุณ'
        },
        password: {
          weak: 'รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%*?&)',
          short: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
          empty: 'กรุณากรอกรหัสผ่าน',
          mismatch: 'รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง'
        },
        name: {
          invalid: 'กรุณากรอกชื่อเป็นตัวอักษร',
          short: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร',
          empty: 'กรุณากรอกชื่อของคุณ'
        }
      },
      validation: {
        required: 'ข้อมูลนี้จำเป็นต้องกรอก',
        invalid: 'ข้อมูลไม่ถูกต้อง',
        tooShort: 'ข้อมูลสั้นเกินไป',
        tooLong: 'ข้อมูลยาวเกินไป'
      }
    };

    if (type && field && code) {
      return {
        message: errorMessages[type]?.[field]?.[code] || 'เกิดข้อผิดพลาด',
        type,
        field,
        code
      };
    }

    if (type && field) {
      return {
        messages: errorMessages[type]?.[field] || {},
        type,
        field
      };
    }

    if (type) {
      return {
        messages: errorMessages[type] || {},
        type
      };
    }

    return {
      messages: errorMessages,
      available_types: ['login', 'register', 'validation'],
      available_fields: ['email', 'password', 'name', 'general']
    };
  }

  @Get('form-config')
  @ApiOperation({ summary: 'Get form configuration for frontend' })
  @ApiResponse({ status: 200, description: 'Form configuration retrieved' })
  getFormConfig() {
    return {
      login: {
        fields: [
          {
            name: 'email',
            type: 'email',
            label: 'ที่อยู่อีเมล',
            placeholder: 'กรอกอีเมลของคุณ',
            required: true,
            validation: {
              required: 'กรุณากรอกที่อยู่อีเมลของคุณ',
              email: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com'
            }
          },
          {
            name: 'password',
            type: 'password',
            label: 'รหัสผ่าน',
            placeholder: 'กรอกรหัสผ่าน',
            required: true,
            validation: {
              required: 'กรุณากรอกรหัสผ่านของคุณ'
            }
          }
        ],
        submitButton: {
          text: 'เข้าสู่ระบบ',
          loadingText: 'กำลังเข้าสู่ระบบ...'
        }
      },
      register: {
        fields: [
          {
            name: 'name',
            type: 'text',
            label: 'ชื่อ-นามสกุล',
            placeholder: 'กรอกชื่อของคุณ',
            required: false,
            validation: {
              minLength: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร'
            }
          },
          {
            name: 'email',
            type: 'email',
            label: 'ที่อยู่อีเมล',
            placeholder: 'กรอกอีเมลของคุณ',
            required: true,
            validation: {
              required: 'กรุณากรอกที่อยู่อีเมลของคุณ',
              email: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com'
            }
          },
          {
            name: 'password',
            type: 'password',
            label: 'รหัสผ่าน',
            placeholder: 'กรอกรหัสผ่าน',
            required: true,
            hint: 'รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป ประกอบด้วยตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ',
            validation: {
              required: 'กรุณากรอกรหัสผ่าน',
              minLength: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
              pattern: 'รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%*?&)'
            }
          }
        ],
        submitButton: {
          text: 'สมัครสมาชิก',
          loadingText: 'กำลังสมัครสมาชิก...'
        }
      }
    };
  }

  @Get('ui-text')
  @ApiOperation({ summary: 'Get UI text for frontend' })
  @ApiResponse({ status: 200, description: 'UI text retrieved' })
  getUIText() {
    return {
      common: {
        loading: 'กำลังโหลด...',
        error: 'เกิดข้อผิดพลาด',
        success: 'สำเร็จ',
        tryAgain: 'ลองใหม่อีกครั้ง',
        ok: 'ตกลง',
        cancel: 'ยกเลิก',
        close: 'ปิด'
      },
      auth: {
        login: 'เข้าสู่ระบบ',
        register: 'สมัครสมาชิก',
        logout: 'ออกจากระบบ',
        forgotPassword: 'ลืมรหัสผ่าน?',
        noAccount: 'ยังไม่มีบัญชี?',
        haveAccount: 'มีบัญชีแล้ว?',
        loginHere: 'เข้าสู่ระบบที่นี่',
        registerHere: 'สมัครสมาชิกที่นี่'
      },
      validation: {
        required: 'จำเป็นต้องกรอก',
        invalid: 'ไม่ถูกต้อง',
        tooShort: 'สั้นเกินไป',
        tooLong: 'ยาวเกินไป'
      }
    };
  }
}