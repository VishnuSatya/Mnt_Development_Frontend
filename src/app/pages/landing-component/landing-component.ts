import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-component',
  standalone: false,
  templateUrl: './landing-component.html',
  styleUrl: './landing-component.scss'
})
export class LandingComponent {
threads = [
    {
      img: '/assests/IAS.jpg',
      title: 'Daily Current Affairs',
      desc: 'Stay updated with daily curated IAS preparation content.'
    },
    {
      img: 'https://source.unsplash.com/300x200/?notes,study',
      title: 'Study Materials',
      desc: 'Access free high-quality notes and practice papers.'
    },
    {
      img: 'https://source.unsplash.com/300x200/?lecture,class',
      title: 'Expert Lectures',
      desc: 'Learn from live & recorded sessions by top faculty.'
    },
    {
      img: 'https://source.unsplash.com/300x200/?motivation,success',
      title: 'Motivation Hub',
      desc: 'Inspiring talks and interviews to keep you focused.'
    }
  ];
}
