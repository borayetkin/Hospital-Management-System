import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { patientApi } from '@/api';
import { Star } from 'lucide-react';

const AppointmentReview: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await patientApi.reviewAppointment(Number(appointmentId), rating, review);
      toast.success('Review submitted successfully');
      navigate(-1);
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <div className="max-w-2xl mx-auto my-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-3xl font-semibold">Review Appointment</h1>
        </div>

        <Card>
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl">Rate Your Experience</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="review" className="text-sm font-medium">
                  Your Review
                </label>
                <Textarea
                  id="review"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentReview; 