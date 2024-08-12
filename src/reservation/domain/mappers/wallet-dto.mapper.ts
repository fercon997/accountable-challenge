import { WalletDto } from '../dto';
import { Wallet } from '../../common/entities';
import { mapReservationArrayToDto } from './reservation-dto.mapper';

export const mapWalletToDto = (wallet: Wallet): WalletDto => {
  const { userId, _id: id, balance, reservations } = wallet;

  return {
    id,
    userId,
    balance,
    reservations: mapReservationArrayToDto(reservations),
  };
};
