import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

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
                const countryCode = data.countryCode;
                const payload = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    message: data.message,
                    contactNumber,
                    countryCode
                }

                const res = await 
            }
        }

    return(
        <div>

        </div>
    )
}

export { 
    ContactForm
}