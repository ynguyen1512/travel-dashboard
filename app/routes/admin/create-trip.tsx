import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { LayerDirective, LayersDirective, MapsComponent } from "@syncfusion/ej2-react-maps";
import { Header } from "components";
import { useState } from "react";
import { useNavigate } from "react-router";
import { account } from "~/appwrite/client";
import { comboBoxItems, selectItems } from "~/constants";
import { world_map } from "~/constants/world_map";
import { cn, formatKey } from "~/lib/utils";
import type { Route } from "./+types/create-trip";

export const loader = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    return data.map((country: any) => ({
        name: country.flag + country.name.common,
        coordinates: country.latlng,
        value: country.name.common,
        openStreetMap: country.map?.openStreetMap
    }));
}

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
    const countries = loaderData as Country[];
    const navigate = useNavigate()

    const [formData, setFormData] = useState<TripFormData>({
        country: countries[0]?.name || '',
        travelStyle: '',
        duration: 0,
        budget: '',
        groupType: '',
        interest: ''
    })

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        if (!formData.country || !formData.interest ||
            !formData.travelStyle || !formData.duration ||
            !formData.budget || !formData.groupType
        ) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }
        if (formData.duration < 1 || formData.duration > 10) {
            setError('Duration must be between 1 and 10 days');
            setLoading(false);
            return;
        }
        const user = await account.get();
        if (!user.$id) {
            console.error('User not authenticated');
            setLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/create-trip', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    country: formData.country,
                    numberOfDays: formData.duration,
                    travelStyles: formData.travelStyle,
                    interests: formData.interest,
                    budget: formData.budget,
                    groupTypes: formData.groupType,
                    userId: user.$id
                })
            })
            const result: CreateTripResponse = await response.json();
            if (result?.id) navigate(`/trips/${result.id}`)
            else {
                console.error('Failed to create trip:', result);
                setError('Failed to generate trip, please try again later.');
            }

        } catch (error) {
            console.error('Error generating trip:', error);
            setError('Failed to generate trip, please try again later.');

        }
        finally {
            setLoading(false)
        }
    };

    const countryData = countries.map((country) => ({
        text: country.name,
        value: country.value,
    }))

    const handleChange = (key: keyof TripFormData, value: string | number) => {
        setFormData({ ...formData, [key]: value });
    }

    const mapData = [
        {
            country: formData.country,
            color: '#EA382E',
            coordinates: countries.find((c: Country) => c.name === formData.country)?.coordinates || []
        }
    ]
    return (
        <main className="flex flex-col gap-10 pb-20 wrapper">
            <Header title="Add a New Trip"
                description="View and edit AI generated travel plans"
            />
            <section className="mt-2.5 wrapper-md">
                <form className="trip-form" onSubmit={handleSubmit} action="">
                    <div>
                        <label htmlFor="country">Country</label>
                        <ComboBoxComponent
                            id="country"
                            dataSource={countryData}
                            fields={{ text: 'text', value: 'value' }}
                            placeholder="Select a country"
                            className="combo-box"
                            change={(e: { value: string | undefined }) => {
                                if (e.value) {
                                    handleChange('country', e.value);
                                }
                            }}
                            allowFiltering
                            filtering={(e) => {
                                const query = e.text.toLowerCase()
                                e.updateData(
                                    countries.filter((country) => country.name.toLowerCase().includes(query)).map((country) => ({
                                        text: country.name,
                                        value: country.value,
                                    }))
                                )
                            }}
                        />
                    </div>
                    <div>
                        <label htmlFor="duration">Duration</label>
                        <input
                            type="duration"
                            name="duration"
                            placeholder="Enter a number of days (5,12, ...)"
                            className="form-input placeholder:text-gray-100"
                            onChange={(e) => handleChange('duration', Number(e.target.value))}
                        />
                    </div>

                    {selectItems.map((key) => (
                        <div key={key}>
                            <label htmlFor={key}>{formatKey(key)}</label>
                            <ComboBoxComponent
                                id={key}
                                dataSource={comboBoxItems[key].map((item) => ({
                                    text: item,
                                    value: item,
                                }))}
                                fields={{ text: 'text', value: 'value' }}
                                placeholder={`Select ${formatKey(key)}`}
                                change={(e: { value: string | undefined }) => {
                                    if (e.value) {
                                        handleChange(key, e.value);
                                    }
                                }}
                                allowFiltering
                                filtering={(e) => {
                                    const query = e.text.toLowerCase()
                                    e.updateData(
                                        comboBoxItems[key]
                                            .filter((item) => item.toLowerCase().includes(query))
                                            .map((item) => ({
                                                text: item,
                                                value: item,
                                            }))
                                    )
                                }}
                                className="combo-box"
                            >

                            </ComboBoxComponent>
                        </div>
                    ))}

                    <div>
                        <label htmlFor="location">Location on the world map</label>
                        <MapsComponent>
                            <LayersDirective>
                                <LayerDirective
                                    shapeData={world_map}
                                    dataSource={mapData}
                                    shapePropertyPath="name"
                                    shapeDataPath="country"
                                    shapeSettings={{ colorValuePath: 'color', fill: '#e5e5e5' }}
                                />
                            </LayersDirective>
                        </MapsComponent>
                    </div>

                    <div className="bg-gray-100 h-px w-full" />
                    {error && (
                        <div className="error">
                            <p>{error}</p>
                        </div>
                    )}
                    <footer className="px-6 w-full">
                        <ButtonComponent type="submit" className="button-class !h-12 !w-full" disabled={loading}>
                            <img src={`/assets/icons/${loading ? 'loading.svg' : 'magic-star.svg'}`} alt="" className={cn('size-5',
                                { 'animate-spin': loading }
                            )} />
                            <span className="p-16-semibold text-white">{loading ? 'Generating ...' : 'Generate Trip'}</span>
                        </ButtonComponent>
                    </footer>
                </form>
            </section>
        </main>
    )
}

export default CreateTrip