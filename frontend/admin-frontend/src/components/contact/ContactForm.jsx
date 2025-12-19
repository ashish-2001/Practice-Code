import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { apiConnector } from "../../services/apiConnector";
import { contactEndpoint } from "../../services/apis";

function ContactForm(){

    const [ loading, setLoading ] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: {
            errors,
            isSubmitSuccessful
        }} = useForm();

        useEffect(() => {
            if(isSubmitSuccessful){
                reset({
                    firstName: "",
                    lastName: "",
                    email: "",
                    message: "",
                    contactNumber: ""
                })
            }
        }, [reset, isSubmitSuccessful]);

        const onSubmit = async (data) => {
            console.log(data);
            try{
                setLoading(true);
                const contactNumber = data.countryCode+" "+data.contactNumber;
                const payload = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    message: data.message,
                    contactNumber
                }

                const res = await apiConnector("POST", contactEndpoint.CONTACT_US_API, payload)

                if(res.data.success === true){
                    toast.success("Message sent successfully");
                } else{
                    toast.error("Failed to send message");
                }
            } catch(error){
                console.log(error);
                toast.error("Failed to send message");
            } finally{
                setLoading(false);
                reset();
            }
        }

    return(
        loading ? (<div className="">Loading</div>) : (
            <div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <div>
                            <label htmlFor="name">Name</label>
                            <input type="text" name="name" placeholder="Enter name!"
                            {...register("name", { required: true })}/>
                            {
                                errors.name && <span>Enter name*</span>
                            }
                        </div>
                        <div>
                            <label htmlFor="email"> Email:</label>
                            <input type="email" name="email" placeholder="Enter Email!" 
                                {...register("email", { required: true })}/>
                                {
                                    errors.email && <span>Enter email*</span>
                                }
                        </div>
                        <div>
                            <label htmlFor="contactNumber"> Contact Number:</label>
                            <input type="tel" name="contactNumber" id="contactNumber" placeholder="+913823493824"
                            {...register("contactNumber", {
                                required: "Please enter contact number",
                                maxLength: { value: 12, message: "Enter a valid contact number"},
                                minLength: { value: 8, message: "Enter a valid contact number"}
                            })}/>
                            {
                                errors.contactNumber && <span>{errors.contactNumber.message}</span>
                            }
                        </div>
                    </div>

                    <div>
                        <label htmlFor="message">Message:</label>
                        <textarea name="message" id="message" cols="30" rows="7" placeholder="Enter your message here" 
                        {...register("message", { required: true })}/>
                        {
                            errors.message && <span>Enter message*</span>
                        }
                    </div>
                    <button type="submit">Send Message!</button>
                </form>
            </div>
        )
    )
}

export { 
    ContactForm
}