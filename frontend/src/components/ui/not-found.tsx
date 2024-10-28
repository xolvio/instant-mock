import {motion} from 'framer-motion';
import {Frown, Home, RefreshCcw} from 'lucide-react';
import React from 'react';
import {useNavigate} from 'react-router';
import {Button} from './button';

export default function NotFound() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: {opacity: 0, y: -50},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 260,
        damping: 20,
        staggerChildren: 0.1,
      },
    },
  };

  const childVariants = {
    hidden: {opacity: 0, y: 20},
    visible: {opacity: 1, y: 0},
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted p-4">
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={childVariants} className="mb-8">
          <Frown className="w-24 h-24 mx-auto text-muted-foreground" />
        </motion.div>
        <motion.h1 variants={childVariants} className="text-4xl font-bold mb-4">
          Oops! Page Not Found
        </motion.h1>
        <motion.p
          variants={childVariants}
          className="text-xl text-muted-foreground mb-8"
        >
          It seems you've ventured into uncharted territory.
        </motion.p>
        <motion.div
          variants={childVariants}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button
            onClick={() => navigate(`/`)}
            className="flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Go Back
          </Button>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"
        animate={{
          scaleX: [0, 1, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 5,
          ease: 'easeInOut',
          times: [0, 0.5, 1],
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />
    </div>
  );
}
