import { DatePicker, TimePicker } from '@/components/ui/date-time-picker';
import { SearchableSelect } from '@/components/shared/SearchableSelect';

export function WebSelect({ value, options, placeholder, onChange, searchable = true }: { value: string; options: string[]; placeholder: string; onChange: (value: string) => void; searchable?: boolean }) {
  return <SearchableSelect value={value} options={options} placeholder={placeholder} onChange={onChange} searchable={searchable} />;
}

export const WebDatePicker = DatePicker;

export const WebTimePicker = TimePicker;