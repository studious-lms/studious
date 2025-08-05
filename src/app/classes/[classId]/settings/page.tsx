"use client";

import { useEffect, useState, useRef } from "react";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/store/appSlice";
import { AlertLevel } from "@/lib/alertLevel";
import Loading from "@/components/Loading";
import Input from "@/components/ui/Input";
import ColorPicker from "@/components/ui/ColorPicker";
import { SUBJECT_OPTIONS, SECTION_OPTIONS } from "@/lib/commonData";
import { trpc } from "@/utils/trpc";
import { RouterOutputs } from "@/utils/trpc";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { HiUpload, HiTrash, HiColorSwatch } from "react-icons/hi";
import Skeleton from "@/components/ui/Skeleton";

// Skeleton component for input fields
const InputSkeleton = () => (
    <div className="flex flex-col space-y-2">
        <Skeleton width="6rem" height="1rem" />
        <Skeleton width="100%" height="2.5rem" />
    </div>
);

// Skeleton component for color picker
const ColorPickerSkeleton = () => (
    <div className="flex flex-col space-y-2">
        <Skeleton width="8rem" height="1rem" />
        <div className="flex flex-col space-y-2">
            <Skeleton width="100%" height="2.5rem" />
            <Skeleton width="12rem" height="1rem" />
        </div>
    </div>
);

// Skeleton for the entire settings page
const SettingsPageSkeleton = () => (
    <div className="flex flex-col space-y-6 w-full">
        {/* Basic Information Card Skeleton */}
        <Card>
            <div className="flex flex-col space-y-4">
                <Skeleton width="8rem" height="1.5rem" />
                <InputSkeleton />
                <InputSkeleton />
                <InputSkeleton />
            </div>
        </Card>

        {/* Classroom Theme Card Skeleton */}
        <Card>
            <div className="flex flex-col space-y-4">
                <Skeleton width="8rem" height="1.5rem" />
                <ColorPickerSkeleton />
            </div>
        </Card>
    </div>
);

export default function Settings({ params }: { params: { classId: string } }) {
    const classId = params.classId;
    const appState = useSelector((state: RootState) => state.app);
    const dispatch = useDispatch();
    
    const [classProps, setClassProps] = useState<RouterOutputs['class']['get']['class'] | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Get class data
    const { data: classData, isLoading } = trpc.class.get.useQuery({ classId });

    // Update class mutation
    const updateClass = trpc.class.update.useMutation({
        onError: (error) => {
            dispatch(addAlert({
                level: AlertLevel.ERROR,
                remark: error.message,
            }));
        }
    });

    useEffect(() => {
        if (classData?.class) {
            setClassProps(classData.class);
        }
    }, [classData]);

    useEffect(() => {
        if (!classProps) return;

        updateClass.mutate({
            classId,
            name: classProps.name,
            section: classProps.section,
            subject: classProps.subject,
            color: classProps.color,
        });
    }, [classProps]);

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setBannerPreview(base64String);
            setClassProps(prev => prev ? { ...prev, banner: base64String } : null);
        };
        reader.readAsDataURL(file);
    };

    const removeBanner = () => {
        setBannerPreview(null);
        setClassProps(prev => prev ? { ...prev, banner: null } : null);
    };

    if (isLoading || !classProps) {
        return <SettingsPageSkeleton />;
    }

    return (
        <div className="flex flex-col space-y-6 w-full">
            <Card>
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-semibold">Basic Information</h2>
                    <Input.Text
                        label="Class Name"
                        type="text"
                        value={classProps.name}
                        onChange={(e) => setClassProps({ ...classProps, name: e.target.value })} />
                    <Input.SearchableSelect
                        label="Class Section"
                        value={classProps.section}
                        searchList={SECTION_OPTIONS}
                        onChange={(e) => setClassProps({ ...classProps, section: e.target.value })} />
                    <Input.SearchableSelect
                        label="Class Subject"
                        value={classProps.subject}
                        searchList={SUBJECT_OPTIONS}
                        onChange={(e) => setClassProps({ ...classProps, subject: e.target.value })} />
                </div>
            </Card>

            <Card>
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-semibold">Classroom Theme</h2>
                    <ColorPicker
                        value={classProps.color || "#3B82F6"}
                        onChange={(color) => setClassProps({ ...classProps, color })}
                        label="Theme Color"
                        description="Choose a color that represents your class. This will be used throughout the interface."
                        size="md"
                        showCustomPicker={true}
                    />
                </div>
            </Card>

            {/* <Card>
                <div className="flex flex-col space-y-4">
                    <h2 className="text-lg font-semibold">Classroom Banner</h2>
                    <div className="flex flex-col space-y-4">
                        {bannerPreview ? (
                            <div className="relative">
                                <img 
                                    src={bannerPreview} 
                                    alt="Classroom banner" 
                                    className="w-full h-32 object-cover rounded-lg"
                                />
                                <Button.SM
                                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                                    onClick={removeBanner}
                                >
                                    <HiTrash className="w-4 h-4" />
                                </Button.SM>
                            </div>
                        ) : (
                            <div 
                                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-background-muted/50 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center space-y-2">
                                    <HiUpload className="w-6 h-6 text-foreground-muted" />
                                    <span className="text-sm text-foreground-muted">Click to upload banner</span>
                                </div>
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBannerUpload}
                        />
                    </div>
                </div>
            </Card> */}
        </div>
    );
}