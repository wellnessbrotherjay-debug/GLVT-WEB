import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  image: string;
}

export interface ClassItem {
  name: string;
  time: string;
  instructor: string;
  type: 'Yoga' | 'Pilates' | 'Strength' | 'Meditation';
}

export interface Amenity {
  icon: React.ReactNode;
  title: string;
  description: string;
}