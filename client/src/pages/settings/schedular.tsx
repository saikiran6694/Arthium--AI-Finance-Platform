import { Separator } from "@/components/ui/separator"
import SchedularCard from "./_components/schedular-card"

const ReportSchedular = () => {
  return (
    <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium">Report Scheduler</h3>
      <p className="text-sm text-muted-foreground">
        Configure the report scheduler to automatically generate and send reports at specified intervals. Choose between daily, weekly, or monthly schedules, and customize the recipients and report formats.
      </p>
    </div>
    <Separator />
    <SchedularCard />
  </div>
  )
}

export default ReportSchedular
