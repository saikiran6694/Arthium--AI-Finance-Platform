export interface ReportType {
    _id: string;
    user_id: string;
    period: string;
    sent_date: string;
    status: string;
    created_at: string;
    updated_at: string;
    __v: number;
}

export interface GetAllReportResponse {
    message: string;
    reports: ReportType[];
    pagination: {
        page_size: number;
        page_number: number;
        total_count: number;
        total_pages: number;
        skip: number;
    }
}

export interface UpdateReportSettingParams {
    is_enabled: boolean;
}