import { useState } from "react";

function ProductBuilderForm(){
    const { token } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const { product } = useSelector((state) => state.product);

    function goNext(){
        if(product.productContent.length > 0){
            dispatch(setStep(3));
        } else{
            toast.error('Please add at least one product')
        }
    }

    const {
        register,
        handleSubmit,
        setValue,+
        formState: { errors }
    } = useForm();

    const onSubmit = async (Data) => {
        let result = null;
        setLoading(true);
        if(editSection)
    }
}