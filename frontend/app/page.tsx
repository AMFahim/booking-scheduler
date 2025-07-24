'use client';

import { useState } from 'react';
import { BookingForm } from '@/components/booking-form';
import { BookingDashboard } from '@/components/booking-dashboard';
import { AvailableSlots } from '@/components/available-slots';
import { useBookings, useResources } from '@/hooks/use-bookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Search, Plus } from 'lucide-react';

export default function Home() {
  const { bookings, loading: bookingsLoading, createBooking, cancelBooking } = useBookings();
  const { resources, loading: resourcesLoading } = useResources();
  const [activeTab, setActiveTab] = useState('dashboard');

  const loading = bookingsLoading || resourcesLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="w-64 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading System</h3>
            <p className="text-gray-600 text-sm">Preparing your booking dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-4">
            Resource Booking System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Efficiently manage and book shared resources with intelligent conflict detection and buffer time management.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger 
                value="dashboard" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                <Search className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="book" 
                className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
              >
                <Plus className="w-4 h-4" />
                Book
              </TabsTrigger>
              <TabsTrigger 
                value="availability" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <Clock className="w-4 h-4" />
                Availability
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="dashboard" className="mt-0">
            <BookingDashboard 
              bookings={bookings}
              resources={resources}
              onCancelBooking={cancelBooking}
            />
          </TabsContent>

          <TabsContent value="book" className="mt-0">
            <BookingForm 
              resources={resources}
              onSubmit={createBooking}
            />
          </TabsContent>

          <TabsContent value="availability" className="mt-0">
            <AvailableSlots 
              resources={resources}
              bookings={bookings}
            />
          </TabsContent>
        </Tabs>

        {/* Statistics Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {bookings.filter(b => b.status === 'UPCOMING').length}
              </h3>
              <p className="text-gray-600">Upcoming Bookings</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {bookings.filter(b => b.status === 'ONGOING').length}
              </h3>
              <p className="text-gray-600">Ongoing Sessions</p>
            </CardContent>
          </Card>

          <Card className="text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {resources.length}
              </h3>
              <p className="text-gray-600">Available Resources</p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>© 2025 Resource Booking System.</p>
        </footer>
      </div>
    </div>
  );
}