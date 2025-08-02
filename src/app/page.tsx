"use client";

import { HiArrowRight, HiCalendar, HiClipboard, HiUserGroup, HiChat, HiDocumentText, HiCheck, HiStar } from "react-icons/hi";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Badge from "@/components/Badge";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import { useNavigation, ROUTES } from "@/lib/navigation";

const features = [
    {
        name: 'Class Management',
        description: 'Create and organize classes with ease. Manage students, assignments, and course materials in one place.',
        icon: HiUserGroup,
    },
    {
        name: 'Assignment Tracking',
        description: 'Create, distribute, and grade assignments. Keep track of submissions and provide feedback efficiently.',
        icon: HiClipboard,
    },
    {
        name: 'Calendar Integration',
        description: 'Schedule classes, set due dates, and manage events with our integrated calendar system.',
        icon: HiCalendar,
    },
    {
        name: 'Communication Tools',
        description: 'Stay connected with announcements, messaging, and discussion forums.',
        icon: HiChat,
    },
    {
        name: 'Document Management',
        description: 'Upload, organize, and share course materials and resources securely.',
        icon: HiDocumentText,
    },
];

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Principal",
        content: "Studious has transformed how we manage our school. The interface is intuitive and our teachers love it.",
        rating: 5
    },
    {
        name: "Michael Chen",
        role: "Department Head",
        content: "The best LMS we've ever used. Streamlined workflows and excellent student engagement tools.",
        rating: 5
    },
    {
        name: "Emily Rodriguez",
        role: "Teacher",
        content: "Finally, a platform that actually makes teaching easier. The assignment tracking is phenomenal.",
        rating: 5
    }
];

interface ContactProps {
    name: string;
    email: string;
    subject: 'general' | 'technical' | 'sales' | 'feature' | 'demo' | 'other';
    message: {
        remark: string;
        time: string;
        date: string;
    };
}

export default function Home() {
    const appState = useSelector((root: RootState) => root.app);
    const navigation = useNavigation();

    useEffect(() => {
        if (appState.user.loggedIn) {
            navigation.push(ROUTES.AGENDA);
            return;
        }
    }, [appState.user.id, navigation]);

    const [contact, setContact] = useState<ContactProps>({
        name: "",
        email: "",
        message: {
            remark: "",
            time: "",
            date: "",
        },
        subject: "general",
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(contact);
        setContact({
            name: "",
            email: "",
            message: {
                remark: "",
                time: "",
                date: "",
            },
            subject: "general",
        });
    }

    return (
        <div className="min-h-screen bg-background-muted">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-background">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/30 via-transparent to-primary-100/20"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
                    <div className="text-center">
                        <Badge variant="primary" className="mb-6">
                            <HiStar className="w-3 h-3 mr-1" />
                            Trusted by 500+ educational institutions
                        </Badge>
                        
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                            The Future of
                            <span className="block text-primary-600">
                                Learning Management
                            </span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-foreground-muted mb-10 max-w-3xl mx-auto leading-relaxed">
                            Streamline your educational institution with our modern, intuitive platform designed for teachers, students, and administrators.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Button.Primary 
                                href="/signup"
                                className="font-semibold flex space-x-2 items-center"
                            >
                                <span>Start Free Trial</span>
                                <HiArrowRight className="h-4 w-4" />
                            </Button.Primary>
                            <Button.Light 
                                href="#demo"
                                className="font-semibold flex space-x-2 items-center"
                            >
                                <span>Watch Demo</span>
                                <HiArrowRight className="h-4 w-4" />
                            </Button.Light>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 mb-2">500+</div>
                                <div className="text-foreground-muted">Institutions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 mb-2">50K+</div>
                                <div className="text-foreground-muted">Active Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary-600 mb-2">99.9%</div>
                                <div className="text-foreground-muted">Uptime</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Everything you need to
                            <span className="block text-primary-600">succeed</span>
                        </h2>
                        <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
                            Our comprehensive platform provides all the tools you need to manage your educational institution effectively and efficiently.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card key={feature.name} className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="h-5 w-5 text-primary-600" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground mb-3">{feature.name}</h3>
                                <p className="text-foreground-muted leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-background-muted">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Loved by educators
                            <span className="block text-primary-600">worldwide</span>
                        </h2>
                        <p className="text-lg text-foreground-muted max-w-3xl mx-auto">
                            See what our users have to say about their experience with Studious.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <HiStar key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-foreground-muted mb-6 leading-relaxed">"{testimonial.content}"</p>
                                <div>
                                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                                    <div className="text-sm text-foreground-muted">{testimonial.role}</div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to transform your
                        <span className="block">educational experience?</span>
                    </h2>
                    <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of educational institutions already using Studious to revolutionize their learning management.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button.Primary 
                            href="/signup"
                            className="px-6 py-3 text-base font-semibold bg-white text-primary-600 hover:bg-gray-50"
                        >
                            Start Free Trial
                        </Button.Primary>
                        <Button.Light 
                            onClick={() => {
                                setContact({ ...contact, subject: "demo" });
                                const contactSection = document.getElementById("contact");
                                if (contactSection) {
                                    contactSection.scrollIntoView({ behavior: "smooth" });
                                }
                            }}
                            className="px-6 py-3 text-base font-semibold border-2 border-white text-white hover:bg-white hover:text-primary-600"
                        >
                            Schedule Demo
                        </Button.Light>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-background">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                            Get in touch
                        </h2>
                        <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
                            Have questions? We're here to help. Fill out the form below and we'll get back to you shortly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <Input.Text
                                    label="Name"
                                    name="name"
                                    id="name"
                                    placeholder="Your name"
                                    value={contact.name}
                                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                />

                                <Input.Text
                                    label="Email"
                                    name="email"
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={contact.email}
                                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                />

                                <Input.Select
                                    label="Subject"
                                    name="subject"
                                    id="subject"
                                    value={contact.subject}
                                    onChange={(e) => setContact({ ...contact, subject: e.target.value as 'general' | 'technical' | 'sales' | 'feature' | 'demo' | 'other' })}
                                >
                                    <option value="general">General Inquiry</option>
                                    <option value="technical">Technical Support</option>
                                    <option value="sales">Sales Question</option>
                                    <option value="feature">Feature Request</option>
                                    <option value="demo">Demo</option>
                                    <option value="other">Other</option>
                                </Input.Select>

                                {contact.subject === 'demo' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input.Text
                                            label="Time (GMT +2)"
                                            name="end_time"
                                            id="end_time"
                                            type="time"
                                            value={contact.message.time}
                                            onChange={(e) => setContact({
                                                ...contact, message: {
                                                    ...contact.message,
                                                    time: e.target.value,
                                                }
                                            })}
                                        />
                                        <Input.Text
                                            label="Date"
                                            name="date"
                                            id="date"
                                            type="date"
                                            value={contact.message.date}
                                            onChange={(e) => setContact({
                                                ...contact, message: {
                                                    ...contact.message,
                                                    date: e.target.value,
                                                }
                                            })}
                                        />
                                    </div>
                                )}

                                <Input.Textarea
                                    label="Message"
                                    name="message"
                                    id="message"
                                    rows={4}
                                    placeholder="How can we help you?"
                                    value={contact.message.remark}
                                    onChange={(e) => setContact({
                                        ...contact, message: {
                                            ...contact.message,
                                            remark: e.target.value,
                                        }
                                    })}
                                />

                                <Button.Primary 
                                    type="submit" 
                                    className="w-full py-3 text-base font-semibold"
                                >
                                    Send Message
                                </Button.Primary>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <h3 className="text-xl font-bold text-foreground mb-4">Contact Information</h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <HiChat className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">Support</h4>
                                            <p className="text-foreground-muted">alan.shen27@gmail.com</p>
                                            <p className="text-sm text-foreground-muted">24/7 technical support</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <HiUserGroup className="h-4 w-4 text-primary-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground">Sales</h4>
                                            <p className="text-foreground-muted">alan.shen27@gmail.com</p>
                                            <p className="text-sm text-foreground-muted">Get a custom quote</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="text-lg font-bold text-foreground mb-4">Why choose Studious?</h3>
                                <ul className="space-y-2">
                                    <li className="flex items-center space-x-2">
                                        <HiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-foreground-muted">Easy to use interface</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <HiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-foreground-muted">24/7 customer support</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <HiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-foreground-muted">Secure and reliable</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <HiCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        <span className="text-foreground-muted">Regular updates and features</span>
                                    </li>
                                </ul>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}