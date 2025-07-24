'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Booking, Resource } from '@/types/booking';
import { formatDateTime, formatTime, groupBookingsByResource } from '@/lib/booking-utils';
import { Calendar, Clock, User, X, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingDashboardProps {
  bookings: Booking[];
  resources: Resource[];
  onCancelBooking: (id: number) => Promise<boolean>;
}

export function BookingDashboard({ bookings, resources, onCancelBooking }: BookingDashboardProps) {
  const [resourceFilter, setResourceFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grouped'>('grouped');

  const filteredBookings = bookings.filter(booking => {
    if (resourceFilter && resourceFilter !== 'all' && booking.resource !== resourceFilter) {
      return false;
    }
    
    if (dateFilter) {
      const bookingDate = new Date(booking.startTime).toDateString();
      const filterDate = new Date(dateFilter).toDateString();
      if (bookingDate !== filterDate) {
        return false;
      }
    }
    
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const aTime = new Date(a.startTime).getTime();
    const bTime = new Date(b.startTime).getTime();
    return aTime - bTime;
  });

  const groupedBookings = groupBookingsByResource(sortedBookings);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ONGOING':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PAST':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const handleCancelBooking = (id: number) => {
    const success = onCancelBooking(id);
    if (!success) {
      alert('Cannot cancel ongoing or past bookings');
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="mb-4 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-900">{booking.resource}</span>
              <Badge className={cn('text-xs', getStatusColor(booking.status))}>
                {booking.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
              <span className="text-gray-400">•</span>
              <span>{formatDateTime(booking.startTime).split(',')[0]}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{booking.requestedBy}</span>
            </div>
          </div>
          
          {booking.status === 'UPCOMING' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancelBooking(booking.id)}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Booking Dashboard
          </CardTitle>
          <CardDescription className="text-gray-600">
            Manage and track all resource bookings
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="w-4 h-4" />
              Filters:
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full sm:w-64 border-gray-200">
                  <SelectValue placeholder="All Resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {resources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.name}>
                      {resource.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={dateFilter}
                min={getTodayDate()}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full sm:w-48 border-gray-200"
                placeholder="Filter by date"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs"
              >
                List View
              </Button>
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
                className="text-xs"
              >
                Grouped View
              </Button>
            </div>
          </div>
          
          {/* Clear Filters */}
          {(resourceFilter || dateFilter) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResourceFilter('all');
                  setDateFilter('');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Display */}
      {sortedBookings.length === 0 ? (
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No Bookings Found</h3>
            <p className="text-gray-500">
              {resourceFilter || dateFilter 
                ? 'Try adjusting your filters to see more results.'
                : 'No bookings have been created yet. Create your first booking above!'
              }
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">All Bookings ({sortedBookings.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {sortedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedBookings).map(([resource, resourceBookings]) => (
            <Card key={resource} className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  {resource}
                  <Badge variant="secondary" className="ml-auto">
                    {resourceBookings.length} booking{resourceBookings.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {resources.find(r => r.name === resource)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {resourceBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}