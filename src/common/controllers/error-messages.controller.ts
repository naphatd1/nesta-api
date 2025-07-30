import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Error Messages')
@Controller('error-messages')
export class ErrorMessagesController {
  @Get('auth')
  @ApiOperation({ summary: 'Get authentication error messages' })
  @ApiResponse({ status: 200, description: 'Authentication error messages retrieved' })
  getAuthErrorMessages() {
    return {
      login: {
        invalidEmail: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com',
        userNotFound: 'ไม่พบบัญชีผู้ใช้งานที่ตรงกับอีเมลนี้ กรุณาตรวจสอบอีเมลอีกครั้งหรือสมัครสมาชิกใหม่',
        wrongPassword: 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านและลองใหม่อีกครั้ง',
        accountSuspended: 'บัญชีของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อขอความช่วยเหลือ',
        emptyPassword: 'กรุณากรอกรหัสผ่านของคุณ',
        emptyEmail: 'กรุณากรอกที่อยู่อีเมลของคุณ'
      },
      register: {
        emailExists: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาลองใช้อีเมลอื่นหรือเข้าสู่ระบบหากคุณมีบัญชีอยู่แล้ว',
        weakPassword: 'รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก (a-z) ตัวอักษรพิมพ์ใหญ่ (A-Z) ตัวเลข (0-9) และอักขระพิเศษ (@$!%*?&)',
        shortPassword: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
        invalidName: 'กรุณากรอกชื่อเป็นตัวอักษร',
        shortName: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร',
        invalidEmail: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com'
      },
      general: {
        unauthorized: 'การยืนยันตัวตนไม่สำเร็จ กรุณาเข้าสู่ระบบใหม่อีกครั้ง',
        badRequest: 'ข้อมูลไม่ถูกต้องตามรูปแบบที่กำหนด',
        conflict: 'ข้อมูลนี้มีอยู่ในระบบแล้ว',
        notFound: 'ไม่พบข้อมูลที่ต้องการ',
        forbidden: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
        serverError: 'เกิดข้อผิดพลาดของระบบ กรุณาลองใหม่อีกครั้ง'
      }
    };
  }

  @Get('validation')
  @ApiOperation({ summary: 'Get validation error messages' })
  @ApiResponse({ status: 200, description: 'Validation error messages retrieved' })
  getValidationErrorMessages() {
    return {
      email: {
        required: 'กรุณากรอกที่อยู่อีเมล',
        invalid: 'กรุณากรอกที่อยู่อีเมลให้ถูกต้อง เช่น example@email.com',
        format: 'รูปแบบอีเมลไม่ถูกต้อง'
      },
      password: {
        required: 'กรุณากรอกรหัสผ่าน',
        minLength: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร',
        pattern: 'รหัสผ่านต้องประกอบด้วย ตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ',
        weak: 'รหัสผ่านไม่ปลอดภัยเพียงพอ'
      },
      name: {
        required: 'กรุณากรอกชื่อ',
        minLength: 'ชื่อต้องมีความยาวอย่างน้อย 2 ตัวอักษร',
        invalid: 'กรุณากรอกชื่อเป็นตัวอักษร'
      },
      general: {
        required: 'ข้อมูลนี้จำเป็นต้องกรอก',
        invalid: 'ข้อมูลไม่ถูกต้อง',
        tooShort: 'ข้อมูลสั้นเกินไป',
        tooLong: 'ข้อมูลยาวเกินไป'
      }
    };
  }

  @Get('ui')
  @ApiOperation({ summary: 'Get UI error messages for frontend' })
  @ApiResponse({ status: 200, description: 'UI error messages retrieved' })
  getUIErrorMessages() {
    return {
      titles: {
        error: 'เกิดข้อผิดพลาด',
        warning: 'คำเตือน',
        success: 'สำเร็จ',
        info: 'ข้อมูล'
      },
      buttons: {
        tryAgain: 'ลองใหม่อีกครั้ง',
        ok: 'ตกลง',
        cancel: 'ยกเลิก',
        close: 'ปิด',
        login: 'เข้าสู่ระบบ',
        register: 'สมัครสมาชิก'
      },
      placeholders: {
        email: 'กรอกอีเมลของคุณ',
        password: 'กรอกรหัสผ่าน',
        name: 'กรอกชื่อของคุณ',
        confirmPassword: 'ยืนยันรหัสผ่าน'
      },
      hints: {
        passwordRequirements: 'รหัสผ่านต้องมี 8 ตัวอักษรขึ้นไป ประกอบด้วยตัวพิมพ์เล็ก พิมพ์ใหญ่ ตัวเลข และอักขระพิเศษ',
        emailFormat: 'ตัวอย่าง: user@example.com',
        forgotPassword: 'ลืมรหัสผ่าน?',
        noAccount: 'ยังไม่มีบัญชี?',
        haveAccount: 'มีบัญชีแล้ว?'
      },
      loading: {
        login: 'กำลังเข้าสู่ระบบ...',
        register: 'กำลังสมัครสมาชิก...',
        loading: 'กำลังโหลด...',
        processing: 'กำลังดำเนินการ...'
      }
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all error messages' })
  @ApiResponse({ status: 200, description: 'All error messages retrieved' })
  getAllErrorMessages() {
    return {
      auth: this.getAuthErrorMessages(),
      validation: this.getValidationErrorMessages(),
      ui: this.getUIErrorMessages()
    };
  }
}