import { ConfigService } from '@nestjs/config'
import { Injectable, Logger } from '@nestjs/common'

import * as nodemailer from 'nodemailer'

interface SmtpInfo {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

@Injectable()
export class MailService {
  private readonly nodeEnv: string
  private readonly passwordResetUrl: string
  private readonly smtpInfo: SmtpInfo

  private readonly logger = new Logger(MailService.name)

  constructor(configService: ConfigService) {
    this.nodeEnv = configService.get<string>('NODE_ENV')
    this.passwordResetUrl = configService.get<string>('PASSWORD_RESET_URL')
    this.smtpInfo = {
      host: configService.get<string>('SMTP_HOST'),
      port: configService.get<number>('SMTP_PORT'),
      user: configService.get<string>('SMTP_USER'),
      pass: configService.get<string>('SMTP_PASS'),
      from: configService.get<string>('SMTP_FROM')
    }
  }

  sendPasswordResetMail(userEmail: string, userName: string, resetToken: string): void {
    const htmlBody = `
    <h2>Solicitação de recadastro de senha - IMS</h2>
    <p>Um recadastro de senha foi solicitado por ${userName}.</p>
    <p><a href="${this.passwordResetUrl}?email=${userEmail}&token=${resetToken}">Clique aqui</a> para cadastrar uma nova senha.</p>
    <p>O link é válido por 30 minutos</p>`

    const subject = 'Solicitação de recadastro de senha - IMS'

    this.sendMail(userEmail, subject, htmlBody)
  }

  private sendMail(to: string, subject: string, body: string): void {
    if (this.nodeEnv === 'test') {
      return
    }

    const transporter = nodemailer.createTransport({
      host: this.smtpInfo.host,
      port: this.smtpInfo.port,
      auth: {
        user: this.smtpInfo.user,
        pass: this.smtpInfo.pass
      }
    })

    const message = {
      from: this.smtpInfo.from,
      to,
      subject,
      html: body
    }

    transporter.sendMail(message, (err) => {
      if (!err) {
        this.logger.log(`Email sent to <${to}> with subject <${subject}>`)
      } else {
        this.logger.error(`There was an error sendind email to <${to}> with subject <${subject}> - ${err.message}`)
      }
    })
  }
}
