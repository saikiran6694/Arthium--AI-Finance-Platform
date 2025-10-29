import { endOfDay, startOfMonth, startOfYear, subDays, subMonths, subYears } from "date-fns";
import { DateRangeEnum, DateRangePreset } from "../enums/date-range.enum";

export const getDateRange = (preset?: DateRangePreset, from?: Date, to?: Date) => {
  if (from && to) {
    return {
      from,
      to,
      value: DateRangeEnum.CUSTOM,
      label: "Custom",
    };
  }
  const now = new Date();
  const yesterday = subDays(now.setHours(0, 0, 0, 0), 1);
  const last30Days = {
    from: subDays(yesterday, 29),
    to: yesterday,
    value: DateRangeEnum.LAST_30_DAYS,
    label: "Last 30 Days",
  };

  switch (preset) {
    case DateRangeEnum.ALL_TIME:
      return { from: null, to: null, value: DateRangeEnum.ALL_TIME, label: "All Time" };

    case DateRangeEnum.LAST_30_DAYS:
      return last30Days;

    case DateRangeEnum.LAST_MONTH:
      return {
        from: startOfMonth(subMonths(now, 1)),
        to: startOfMonth(now),
        value: DateRangeEnum.LAST_MONTH,
        label: "Last Month",
      };

    case DateRangeEnum.LAST_3_MONTHS:
      return {
        from: startOfMonth(subMonths(now, 3)),
        to: startOfMonth(now),
        value: DateRangeEnum.LAST_3_MONTHS,
        label: "Last 3 Months",
      };

    case DateRangeEnum.LAST_YEAR:
      return {
        from: startOfYear(subYears(now, 1)),
        to: startOfYear(now),
        value: DateRangeEnum.LAST_YEAR,
        label: "Last Year",
      };

    case DateRangeEnum.THIS_MONTH:
      return {
        from: startOfMonth(now),
        to: endOfDay(now),
        value: DateRangeEnum.THIS_MONTH,
        label: "This Month",
      };

    case DateRangeEnum.THIS_YEAR:
      return {
        from: startOfYear(now),
        to: endOfDay(now),
        value: DateRangeEnum.THIS_YEAR,
        label: "This Year",
      };

    default:
      return last30Days;
  }
};
