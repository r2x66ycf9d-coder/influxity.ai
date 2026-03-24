import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatMeetingTime, getUserTimezone } from '@/lib/timezone';
import { trackAIFeature } from '@/lib/analytics';

interface ScheduleEvent {
  id: string;
  title: string;
  date: Date;
  duration: number;
  location?: string;
  attendees?: string[];
}

interface AISchedulerProps {
  onSchedule: (event: ScheduleEvent) => void;
  existingEvents?: ScheduleEvent[];
  className?: string;
}

/**
 * Smart scheduling system with AI-powered time suggestions
 * Features: timezone handling, conflict detection, optimal time suggestions
 */
export function AIScheduler({
  onSchedule,
  existingEvents = [],
  className = ''
}: AISchedulerProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const userTimezone = getUserTimezone();

  const handleAISuggest = async () => {
    setIsAnalyzing(true);
    trackAIFeature('scheduler', 'suggestion_requested', { 
      existingEventCount: existingEvents.length 
    });

    // Simulate AI analysis (replace with actual API call)
    setTimeout(() => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14, 0, 0, 0);

      setSuggestions([
        formatMeetingTime(tomorrow),
        formatMeetingTime(nextWeek),
        'Friday, 3:00 PM (Best for team availability)'
      ]);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventDate = new Date(`${date}T${time}`);
    const event: ScheduleEvent = {
      id: Date.now().toString(),
      title,
      date: eventDate,
      duration: parseInt(duration),
      location: location || undefined,
    };

    trackAIFeature('scheduler', 'event_scheduled', {
      duration: parseInt(duration),
      hasLocation: !!location
    });

    onSchedule(event);
    
    // Reset form
    setTitle('');
    setDate('');
    setTime('');
    setDuration('60');
    setLocation('');
    setSuggestions([]);
  };

  const checkConflicts = (): boolean => {
    if (!date || !time) return false;
    
    const newEventDate = new Date(`${date}T${time}`);
    const newEventEnd = new Date(newEventDate.getTime() + parseInt(duration) * 60000);

    return existingEvents.some(event => {
      const eventEnd = new Date(event.date.getTime() + event.duration * 60000);
      return (
        (newEventDate >= event.date && newEventDate < eventEnd) ||
        (newEventEnd > event.date && newEventEnd <= eventEnd) ||
        (newEventDate <= event.date && newEventEnd >= eventEnd)
      );
    });
  };

  const hasConflict = checkConflicts();

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Smart Scheduler</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          {userTimezone}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Team Meeting"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location (Optional)</Label>
          <div className="flex gap-2">
            <MapPin className="w-5 h-5 text-gray-400 mt-2" />
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Conference Room A or Zoom link"
              className="flex-1"
            />
          </div>
        </div>

        {hasConflict && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            ⚠️ This time conflicts with an existing event
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAISuggest}
            disabled={isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Suggest Time
              </>
            )}
          </Button>

          <Button 
            type="submit" 
            className="flex-1 bg-purple-700 hover:bg-purple-700"
            disabled={!title || !date || !time || hasConflict}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Event
          </Button>
        </div>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <p className="text-sm font-medium text-purple-900 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Suggested Times:
          </p>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-purple-700">
                • {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {existingEvents.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Upcoming Events ({existingEvents.length})
          </h4>
          <div className="space-y-2">
            {existingEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium text-gray-800">{event.title}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {formatMeetingTime(event.date)} • {event.duration} min
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
