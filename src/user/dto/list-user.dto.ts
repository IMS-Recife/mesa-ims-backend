export class ListUserDto {
  constructor(user) {
    this._id = user.id
    this.name = user.name
    this.email = user.email
    this.roles = user.roles
  }

  _id: any

  name: string

  email: string

  roles: string[]
}
