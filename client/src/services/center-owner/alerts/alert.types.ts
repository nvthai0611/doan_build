export interface Alert {
  id: any;
  alertType: any;
  title: any;
  message: any;
  severity: any;
  payload?: any;
  isRead: any;
  processed: any;
  triggeredAt: any;
  processedAt?: any;
}

export interface AlertPayload {
  classId?: any;
  className?: any;
  classCode?: any;
  daysRemaining?: any;
  startDate?: any;
  endDate?: any;
  notificationType?: any;
}

export interface GetAlertsParams {
  page?: any;
  limit?: any;
  alertType?: any;
  severity?: any;
  isRead?: any;
  processed?: any;
}

export interface AlertsResponse {
  data: any;
  meta: any;
  message: any;
}

export interface UnreadCountResponse {
  data: any;
  message: any;
}

