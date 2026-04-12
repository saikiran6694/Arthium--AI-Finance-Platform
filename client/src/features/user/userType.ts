export interface User {
  _id: string;
  name: string;
  email: string;
  profile_picture: string;
}
export interface UpdateUserResponse {
  message: string;
  user: User;
}
 
export interface ScheduleReportParams {
  timezone: string;
  scheduled_time: string;
}
 
export interface ScheduledReportTimeResponse {
  scheduled_time: string;
  timezone: string;
}