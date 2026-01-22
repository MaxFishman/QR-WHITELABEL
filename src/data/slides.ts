export interface Slide {
  type: 'title' | 'content' | 'section' | 'list' | 'timeline' | 'definition';
  title?: string;
  subtitle?: string;
  content?: string;
  items?: string[];
  points?: { label: string; text: string }[];
  question?: string;
  answer?: string;
  followUp?: string;
  link?: string;
}

export const chapter1Slides: Slide[] = [
  {
    type: 'title',
    title: 'MEDIA AND WEB DEVELOPMENT',
    subtitle: 'ICOM-101 / MTEC-617',
    content: 'Max Fishman\nArtist & Web Developer\nFull-Stack Engineer @ Karmetik\n\nmfishman@calarts.edu\n(661) 554-2623'
  },
  {
    type: 'section',
    title: 'WEEK 1',
    subtitle: 'Introductions / Syllabus'
  },
  {
    type: 'content',
    title: 'Today\'s Agenda',
    items: [
      'Introductions',
      'What you\'ll need',
      'Some History'
    ]
  },
  {
    type: 'section',
    title: 'What we will learn this semester?',
    subtitle: '01'
  },
  {
    type: 'content',
    title: 'We are building full stack web applications',
    subtitle: '(websites/apps/games)',
    items: [
      'How to build web pages with HTML',
      'How to style web pages with CSS',
      'How to add interactivity with Javascript and other libraries',
      'How to host and manage a website with a custom domain name and analytics',
      'How to setup and use a code editor (IDE) for web development',
      'How to use Github and work on code collaboratively',
      'Lots more!'
    ]
  },
  {
    type: 'content',
    title: 'Our Journey This Semester',
    content: 'In today\'s presentation, we start on a journey through the history and structure of the internet. We will explore its origins, delve into the creation of key web technologies like HTML, CSS, and JavaScript, and understand the fundamental workings of internet protocols, IP addresses, DNS, and domain names.'
  },
  {
    type: 'section',
    title: 'Where will we be starting?',
    subtitle: '02'
  },
  {
    type: 'section',
    title: 'INTERNET HISTORY'
  },
  {
    type: 'timeline',
    question: 'When was the first digital computer created?',
    answer: '1943 - "Colossus"',
    content: 'Designed by General Post Office (GPO) research telephone engineer Tommy Flowers based on plans developed by mathematician Max Newman at the Government Code and Cypher School (UK Government)'
  },
  {
    type: 'timeline',
    question: 'When was the first computer connected to the internet?',
    answer: 'October 29, 1969',
    content: 'The first successful host-to-host connection was made between Stanford Research Institute (SRI) and UCLA, by SRI programmer Bill Duvall and UCLA student programmer Charley Kline, at 10:30 pm PST'
  },
  {
    type: 'timeline',
    question: 'When was the first website published?',
    answer: 'August 6, 1991',
    content: 'Published by British computer scientist Tim Berners-Lee at CERN, the European Organization for Nuclear Research.',
    link: 'https://info.cern.ch/hypertext/WWW/TheProject.html'
  },
  {
    type: 'section',
    title: 'Transmission Control Protocol/Internet Protocol',
    subtitle: 'TCP/IP'
  },
  {
    type: 'content',
    title: 'The Birth of ARPANET',
    content: 'In 1969, ARPANET was brought to life when the first message was sent between two computers located at UCLA and Stanford Research Institute. This event marked the birth of networked communication as we know it. The network gradually expanded, connecting more universities and government sites across the United States.'
  },
  {
    type: 'content',
    title: 'TCP/IP Protocol',
    content: 'In the 1970s, ARPANET introduced the TCP/IP protocol suite, developed by Vint Cerf and Bob Kahn. TCP/IP became the standard networking protocol, defining how data should be packetized, addressed, transmitted, and received. This protocol suite revolutionized data transmission and laid the groundwork for the global internet.\n\nThe adoption of TCP/IP on January 1, 1983, is often considered the official birthdate of the modern internet. From there, the network continued to grow, both in terms of size and capabilities.'
  },
  {
    type: 'section',
    title: 'How the Internet Works',
    subtitle: 'IP Addresses and Protocols'
  },
  {
    type: 'content',
    title: 'Step 1: You Make a Request',
    content: 'You type an address into the browser and hit ENTER.'
  },
  {
    type: 'content',
    title: 'Step 2: DNS Lookup',
    content: 'Your ISP makes a request to a Domain Name Server (DNS).\n\nVisiting a website is a lot like calling someone on the phone. Every website on the internet has a unique IP Address, like a phone number, that points to the server where that website is being hosted.\n\nThe DNS acts like your address book and maps website names to website addresses.\n\nIf you know the IP address of a website, you can bypass the DNS completely.'
  },
  {
    type: 'content',
    title: 'Step 3: DNS Resolves',
    content: 'The DNS looks up the domain name you have requested, and returns the IP address of that website to your ISP.'
  },
  {
    type: 'content',
    title: 'Step 4: Request Forwarded',
    content: 'Your ISP forwards your request to the IP address returned from the DNS.'
  },
  {
    type: 'content',
    title: 'Step 5: Server Response',
    content: 'The website you have requested receives your request.\n\nOnce a web server receives a request, it is expected to generate a response.\n\n• A server at Twitter might dynamically generate your custom homepage and return that as the response\n• An API endpoint might calculate some data and return it in a machine readable format\n• A server hosting a static site may just return a prewritten chunk of html (this is what we are doing!)'
  },
  {
    type: 'content',
    title: 'Step 6: You Receive Response',
    content: 'Your ISP returns the response to YOU.\n\nThe response might be a webpage, a media asset, or some data for the webpage to render.'
  },
  {
    type: 'section',
    title: 'Key Terms',
    subtitle: '02'
  },
  {
    type: 'definition',
    title: 'Server',
    content: 'A server is the computer that hosts your website. Servers make the internet work, but in this class we will avoid dealing with them at the beginning and get to them near the middle of semester.'
  },
  {
    type: 'definition',
    title: 'Client',
    content: 'The client refers to the computer that is visiting your website (the opposite of the server).'
  },
  {
    type: 'definition',
    title: 'Front End / Back End',
    subtitle: 'Client Side / Server Side',
    content: 'The front end and back end refer to the client and server side respectively.\n\nExample: "HTML is a front end language"'
  }
];
