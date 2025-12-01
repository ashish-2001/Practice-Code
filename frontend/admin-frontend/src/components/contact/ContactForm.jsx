import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

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

                if(reset.data.success === true){
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
                        
                    </div>
                </form>
            </div>
        )
    )
}

export { 
    ContactForm
}