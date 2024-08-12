import { Reservation } from '../../common/entities';
import { ReservationDto } from '../dto';

export const mapReservationToDto = (
  reservation: Reservation,
): ReservationDto => {
  const {
    _id: id,
    reservationDate,
    expectedReturnDate,
    returnDate,
    bookId,
    userId,
    lateFees,
    price,
    status,
  } = reservation;

  return {
    id,
    bookId,
    userId,
    price,
    returnDate,
    reservationDate,
    expectedReturnDate,
    status,
    lateFees,
  };
};

export const mapReservationArrayToDto = (reservations: Reservation[]) =>
  reservations.map(mapReservationToDto);
