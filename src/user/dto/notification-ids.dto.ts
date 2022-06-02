import { ArrayNotEmpty } from 'class-validator'

export class NotificationIdsDto {
  @ArrayNotEmpty({ message: 'Informar ao menos um ID de notificação' })
  notificationIds: string[]
}
