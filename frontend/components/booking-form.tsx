'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookingFormData, Resource, CreateBookingRequest } from '@/types/booking';
import { Calendar, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingFormProps {
  resources: Resource[];
  onSubmit: (data: CreateBookingRequest) => Promise<any>;
}

export function BookingForm({ resources, onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    resource: '',
    startTime: '',
    endTime: '',
    requestedBy: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors([]);
    setSuccess(false);

    if (!formData.resource || !formData.startTime || !formData.endTime || !formData.requestedBy) {
      setErrors(['Please fill in all required fields']);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      
      setSuccess(true);
      setFormData({
        resource: '',
        startTime: '',
        endTime: '',
        requestedBy: ''
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error:any) {
        console.error('Full error object:', error);

      const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    'Failed to create booking';
      setErrors([errorMessage]);
    }
    
    setIsSubmitting(false);
  };

  const getTomorrowDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Book a Resource
        </CardTitle>
        <CardDescription className="text-gray-600">
          Reserve your preferred time slot with automatic conflict detection
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource Selection */}
          <div className="space-y-2">
            <Label htmlFor="resource" className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Resource *
            </Label>
            <Select value={formData.resource} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, resource: value }))
            }>
              <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select a resource to book" />
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

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                Start Time *
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                min={getTomorrowDateTime()}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500/20"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endTime" className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-600" />
                End Time *
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                min={formData.startTime || getTomorrowDateTime()}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="border-gray-200 focus:border-red-500 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Requested By */}
          <div className="space-y-2">
            <Label htmlFor="requestedBy" className="text-sm font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-purple-600" />
              Requested By *
            </Label>
            <Input
              id="requestedBy"
              type="text"
              placeholder="Enter your full name"
              value={formData.requestedBy}
              onChange={(e) => setFormData(prev => ({ ...prev, requestedBy: e.target.value }))}
              className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
            />
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Booking created successfully! Your time slot has been reserved.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className={cn(
              "w-full py-3 text-white font-medium rounded-lg transition-all duration-200",
              "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            )}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Booking...
              </div>
            ) : (
              'Book Resource'
            )}
          </Button>
        </form>

        {/* Booking Rules */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Booking Rules</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Minimum booking duration: 15 minutes</li>
            <li>• Maximum booking duration: 2 hours</li>
            <li>• 10-minute buffer time is automatically added before and after each booking</li>
            <li>• Bookings must be scheduled for future dates only</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}