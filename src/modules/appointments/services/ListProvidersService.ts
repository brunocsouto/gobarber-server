import { injectable, inject } from 'tsyringe';

// import AppError from '@shared/errors/AppError';
import ICacheProvider from '@shared/container/providers/CacheProvider/models/ICacheProvider';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import AppError from '@shared/errors/AppError';

import User from '@modules/users/infra/typeorm/entities/User';

interface IRequest {
  user_id: string;
}

@injectable()
class ListProvidersService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('CacheProvider')
    private cacheProvider: ICacheProvider,
  ) {}

  public async execute({ user_id }: IRequest): Promise<User[]> {
    const cachedUsers = await this.cacheProvider.recover<User[]>(
      `providers-list:${user_id}`,
    );

    let users: User[];

    if (cachedUsers) {
      users = cachedUsers;
    } else {
      users = await this.usersRepository.findAllProviders({
        except_user_id: user_id,
      });

      if (!users) {
        throw new AppError('User not found.');
      }

      console.log('A query no banco foi feita');

      await this.cacheProvider.save(`providers-list:${user_id}`, users);
    }

    return users;
  }
}

export default ListProvidersService;
