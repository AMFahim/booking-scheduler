'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Resource } from '@/types/booking';
import { formatTime } from '@/lib/booking-utils';
import { Clock, Calendar, CheckCircle, Loader2, Timer } from 'lucide-react';
import { useAvailableSlots } from '@/hooks/use-bookings';

interface AvailableSlotsProps {
  resources: Resource[];
  bookings?: any[];
}

export function AvailableSlots({ resources }: AvailableSlotsProps) {
  const [selectedResource, setSelectedResource] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // Default 1 hour
  
  const { slots, loading, error, fetchAvailableSlots } = useAvailableSlots();

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' }
  ];

  useEffect(() => {
    if (selectedResource && selectedDate && selectedDuration) {
      fetchAvailableSlots({
        resource: selectedResource,
        date: selectedDate,
        duration: selectedDuration
      });
    }
  }, [selectedResource, selectedDate, selectedDuration, fetchAvailableSlots]);

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleBookSlot = (slot: any) => {
    console.log('Booking slot:', slot);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Available Time Slots
        </CardTitle>
        <CardDescription className="text-gray-600">
          Check availability for your preferred resource and date
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Select Resource
            </label>
            <Select value={selectedResource} onValueChange={setSelectedResource}>
              <SelectTrigger className="border-gray-200 focus:border-blue-500">
                <SelectValue placeholder="Choose a resource" />
              </SelectTrigger>
              <SelectContent>
                {resources.map((resource) => (
                  <SelectItem key={resource.id} value={resource.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{resource.name}</span>
                      <span className="text-xs text-gray-500">{resource.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              min={getTodayDate()}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-gray-200 focus:border-green-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Timer className="w-4 h-4 text-purple-600" />
              Duration
            </label>
            <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(Number(value))}>
              <SelectTrigger className="border-gray-200 focus:border-purple-500">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">Error: {error}</p>
          </div>
        )}

        {/* Available Slots */}
        {selectedResource && selectedDate && selectedDuration ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Available Slots for {selectedResource} ({durationOptions.find(d => d.value === selectedDuration)?.label})
              </h3>
              <Badge variant="secondary" className="ml-auto">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Badge>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading available slots...</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-600 mb-2">No Available Slots</h4>
                <p className="text-gray-500">
                  All time slots are booked or outside business hours.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {slots.map((slot, index) => (
                  <Card key={index} className="border-green-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-gray-900">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          {slot.duration} minutes
                        </Badge>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleBookSlot(slot)}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Business Hours Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Business Hours</h4>
              <p className="text-sm text-blue-700">
                Resources are available for booking between business hours.
                Each booking includes a buffer time to prevent conflicts.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">Select Resource, Date & Duration</h4>
            <p className="text-gray-500">
              Choose a resource, date, and duration to view available time slots.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}