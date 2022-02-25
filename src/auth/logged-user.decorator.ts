import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface LoggedUserFields {
  _id: string
  email?: string,
  roles: string[]
}

export const LoggedUser = createParamDecorator((data: unknown, context: ExecutionContext): LoggedUserFields => {
  const request = context.switchToHttp().getRequest()
  return request.user
})
