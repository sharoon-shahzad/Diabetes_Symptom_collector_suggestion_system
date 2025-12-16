import React, { useEffect, useState, useRef } from 'react';
import { Box, Container, Typography, Card, CardContent, Avatar, useTheme, alpha } from '@mui/material';
import { Star } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fetchAllFeedback } from '../../utils/api';

// Static testimonials to show when no real testimonials are available
const staticTestimonials = [
  {
    _id: 'static-1',
    name: 'Sarah Johnson',
    role: 'Diabetes Patient',
    comment: 'This system helped me understand my symptoms better and provided actionable recommendations. The AI assessment was incredibly accurate!',
    avatar: 'SJ',
    rating: 5,
    isStatic: true,
  },
  {
    _id: 'static-2',
    name: 'Dr. Michael Chen',
    role: 'Endocrinologist',
    comment: 'As a healthcare professional, I recommend this tool to my patients. It provides valuable insights and helps with early detection.',
    avatar: 'MC',
    rating: 5,
    isStatic: true,
  },
  {
    _id: 'static-3',
    name: 'Emily Rodriguez',
    role: 'Health Coach',
    comment: 'The personalized recommendations are spot-on. My clients love how easy it is to track their symptoms and get instant feedback.',
    avatar: 'ER',
    rating: 5,
    isStatic: true,
  },
];

export default function TestimonialsSection() {
  const theme = useTheme();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUsingStatic, setIsUsingStatic] = useState(false);
  const scrollContainerRef = useRef(null);
  const scrollAnimationRef = useRef(null);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    // Cleanup previous animation
    if (scrollAnimationRef.current) {
      cancelAnimationFrame(scrollAnimationRef.current);
      scrollAnimationRef.current = null;
    }

    if (testimonials.length > 0 && !loading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startInfiniteScroll();
      }, 200);

      return () => {
        clearTimeout(timer);
        if (scrollAnimationRef.current) {
          cancelAnimationFrame(scrollAnimationRef.current);
          scrollAnimationRef.current = null;
        }
      };
    }
  }, [testimonials, loading]);

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      let allTestimonials = [];
      let page = 1;
      let hasMore = true;

      // Fetch all pages to get all feedback
      while (hasMore) {
        const data = await fetchAllFeedback(page, 50);
        const feedback = data.feedback || [];
        
        // Filter for ratings > 4.5
        const filtered = feedback.filter(fb => fb.rating > 4.5);
        allTestimonials = [...allTestimonials, ...filtered];
        
        hasMore = page < (data.pagination?.pages || 1);
        page++;
      }

      // Minimum testimonials needed for smooth scrolling (at least 4)
      const MIN_TESTIMONIALS_FOR_SMOOTH_SCROLL = 4;
      
      let testimonialsToUse = [];
      
      if (allTestimonials.length === 0) {
        // No real testimonials - use all static ones
        testimonialsToUse = staticTestimonials;
        setIsUsingStatic(true);
      } else if (allTestimonials.length < MIN_TESTIMONIALS_FOR_SMOOTH_SCROLL) {
        // Not enough real testimonials - add placeholder testimonials to fill up to minimum
        const placeholdersNeeded = MIN_TESTIMONIALS_FOR_SMOOTH_SCROLL - allTestimonials.length;
        const placeholders = staticTestimonials.slice(0, placeholdersNeeded);
        testimonialsToUse = [...allTestimonials, ...placeholders];
        setIsUsingStatic(true);
      } else {
        // Enough real testimonials - use only real ones (no placeholders)
        testimonialsToUse = allTestimonials;
        setIsUsingStatic(false);
      }

      // Duplicate once for seamless infinite scroll (needed for the scroll loop effect)
      const duplicatedTestimonials = [...testimonialsToUse, ...testimonialsToUse];
      
      setTestimonials(duplicatedTestimonials);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const startInfiniteScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || testimonials.length === 0) return;

    // Ensure container is ready
    if (container.scrollWidth <= container.clientWidth) {
      // Content fits in container, no need to scroll
      return;
    }

    const scroll = () => {
      if (!container) {
        return;
      }

      if (isHoveredRef.current) {
        scrollAnimationRef.current = requestAnimationFrame(scroll);
        return;
      }

      container.scrollLeft += 0.5; // Scroll speed

      // Reset scroll position when reaching the midpoint for seamless loop
      const maxScroll = container.scrollWidth / 2;
      if (container.scrollLeft >= maxScroll - 5) {
        container.scrollLeft = 0;
      }

      scrollAnimationRef.current = requestAnimationFrame(scroll);
    };

    // Reset scroll position to start
    container.scrollLeft = 0;
    scrollAnimationRef.current = requestAnimationFrame(scroll);
  };

  const handleMouseEnter = () => {
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    isHoveredRef.current = false;
  };

  const getInitials = (name) => {
    if (!name || name === 'Anonymous') return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name || name === 'Anonymous') return theme.palette.primary.main;
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return null; // Don't show anything while loading
  }

  // Always show section (either static or real testimonials)
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 8, background: theme.palette.background.paper, overflow: 'hidden' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
            What Our Users Say
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Trusted by patients and healthcare professionals worldwide
          </Typography>
        </Box>

        <Box
          ref={scrollContainerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          sx={{
            display: 'flex',
            gap: 3,
            overflowX: 'auto', // Allow horizontal scrolling
            overflowY: 'hidden',
            scrollBehavior: 'auto', // Use 'auto' for programmatic scrolling
            cursor: 'grab',
            userSelect: 'none',
            WebkitOverflowScrolling: 'touch',
            width: '100%',
            maxWidth: '100%',
            '&:active': {
              cursor: 'grabbing',
            },
            // Hide scrollbar but allow scrolling
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            pb: 2,
            // Smooth scrolling
            willChange: 'scroll-position',
            // Prevent default scroll behavior
            scrollSnapType: 'none',
          }}
        >
          {testimonials.map((testimonial, index) => {
            // Handle both static placeholder and real testimonials
            // Check if this specific testimonial is a placeholder (has isStatic property)
            const isStatic = testimonial.isStatic === true;
            const userName = isStatic ? testimonial.name : (testimonial.is_anonymous ? 'Anonymous' : testimonial.user?.fullName || 'User');
            const userComment = testimonial.comment || 'Great experience!';
            const userRating = testimonial.rating || 5;
            const userRole = isStatic ? testimonial.role : `${testimonial.rating}★ Rating`;
            const avatarInitials = isStatic ? testimonial.avatar : (testimonial.is_anonymous || !testimonial.user?.fullName ? 'U' : getInitials(testimonial.user.fullName));
            const avatarSrc = isStatic 
              ? undefined 
              : (testimonial.is_anonymous 
                  ? undefined 
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.user?.fullName || 'User')}&background=${getAvatarColor(testimonial.user?.fullName || 'Anonymous').replace('#', '').toUpperCase()}&color=fff&size=128`);

            return (
              <motion.div
                key={`${testimonial._id || `static-${index}`}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{ flexShrink: 0 }}
              >
                <Card
                  sx={{
                    width: 380,
                    minWidth: 380,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                      border: `1px solid ${theme.palette.primary.main}`,
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      flexGrow: 1,
                      height: '100%',
                    }}
                  >
                    {/* Rating Stars */}
                    <Box sx={{ display: 'flex', mb: 3, gap: 0.5 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          sx={{
                            color: i < userRating ? '#ffc107' : theme.palette.action.disabled,
                            fontSize: 20,
                          }}
                        />
                      ))}
                    </Box>

                    {/* Comment */}
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      paragraph
                      sx={{
                        flexGrow: 1,
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        mb: 3,
                        minHeight: 80,
                      }}
                    >
                      "{userComment}"
                    </Typography>

                    {/* User Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                      <Avatar
                        sx={{
                          bgcolor: getAvatarColor(userName),
                          width: 56,
                          height: 56,
                          fontSize: '1.2rem',
                          fontWeight: 600,
                          border: `2px solid ${alpha(getAvatarColor(userName), 0.2)}`,
                        }}
                        src={avatarSrc}
                      >
                        {avatarInitials}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {userName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userRole}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
}

