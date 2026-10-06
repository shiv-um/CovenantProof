import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer


def test_local_inference():
    base_model_id = "Qwen/Qwen2.5-1.5B-Instruct"
    adapter_path = "models/covenant-auditor-lora"

    print("1. Loading Base Model to Apple Silicon (CPU via Swap)...")
    # Force CPU to prevent MPS memory exhaustion on 8GB machines
    device = "cpu"

    tokenizer = AutoTokenizer.from_pretrained(base_model_id)
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        torch_dtype=torch.bfloat16,  # CPU prefers standard float32
        device_map=device,
    )

    print("2. Injecting LoRA Adapter Weights...")
    model = PeftModel.from_pretrained(base_model, adapter_path)

    print("3. Formatting Audit Package...")
    system_prompt = (
        "You are the CovenantProof Chief Credit Reviewer. Synthesize a concise, "
        "formal credit audit memo summarizing the findings and calculations. "
        "Reference evidence-grounded facts and do not make automated credit decisions."
    )

    # Mock data mimicking the LangGraph quantitative node output
    user_content = """
    Findings:
    [
      {"title": "DSCR Below Contractual Covenant", "statement": "Recomputed DSCR is 1.10x, below the 1.25x minimum."},
      {"title": "Payment Discrepancy", "statement": "Invoice amount ($125,000) does not match Bank Payment ($152,000)."}
    ]
    Calculations:
    [
      {"name": "Debt Service Coverage Ratio", "output": 1.10}
    ]
    """

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True
    )

    model_inputs = tokenizer([text], return_tensors="pt").to(device)

    print("4. Generating Audit Memo (Offline Edge Inference)...\n")
    print("-" * 50)

    with torch.no_grad():
        generated_ids = model.generate(
            **model_inputs,
            max_new_tokens=250,
            temperature=0.3,
            repetition_penalty=1.1
        )

    generated_ids = [
        output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
    ]

    response = tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    print(response)
    print("-" * 50)


if __name__ == "__main__":
    test_local_inference()
