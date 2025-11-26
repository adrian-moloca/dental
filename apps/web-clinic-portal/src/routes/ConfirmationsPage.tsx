import { ConfirmationQueue } from '../components/appointments/ConfirmationQueue';

export default function ConfirmationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appointment Confirmations</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Manage and confirm upcoming appointments for tomorrow
        </p>
      </div>

      <ConfirmationQueue />
    </div>
  );
}
