export interface GetNotificationHistoryInput {
  userId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
}
